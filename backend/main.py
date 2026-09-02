from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import os

from database import init_db, SessionLocal
from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message
from services.trip_services import (
    calculate_daily_budget,
    get_trip_category,
    get_recommendation_places,
    list_transportation,
)
from services.bedrock_service import get_ai_recommendation
from services.auth_service import (
    get_current_user,
    register_user,
    login_user,
    get_db,
)
from services.kb_service import retrieve_and_generate

# ── App setup ─────────────────────────────────────────────────
app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schemas ───────────────────────────────────────────
class TripRequest(BaseModel):
    destination:  str
    days:         int
    budget:       float
    travel_style: str


class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class QuestionRequest(BaseModel):
    question: str



# ── Health ────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "Hai Syifa From KelanaAI"}


@app.get("/health")
def health():
    return {"status": "OK"}


# ── Auth ──────────────────────────────────────────────────────
@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(request.name, request.email, request.password, db)
    return {
        "message": "Registration successful",
        "user": {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
        },
    }


@app.post("/api/v1/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return login_user(request.email, request.password, db)

# ── Integrate with kelana by amazon bedrock - knowledge base ─────────────────────────────────────────────────────
@app.post("/api/v1/ask")
def ask_endpoint(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user),
):
    result = retrieve_and_generate(request.question)
    return {
        "question": request.question,
        "answer": result["answer"],
        "documents": result["documents"],
    }

# ── Conversations ─────────────────────────────────────────────
@app.post("/api/v1/conversations", status_code=201)
def create_conversation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new conversation row and return its identifier."""
    conversation = Conversation(user_id=current_user.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return {
        "conversation_id": conversation.id,
        "title":           conversation.title,
        "created_at":      conversation.created_at,
    }


@app.get("/api/v1/conversations")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List previous conversations for the authenticated user."""
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )
    return [
        {
            "id":         c.id,
            "title":      c.title,
            "created_at": c.created_at,
        }
        for c in conversations
    ]


@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    request: QuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Full chat flow:
    1. Receive user message
    2. Save user message to DB
    3. Load previous messages (history)
    4. Build prompt with history context
    5. Call Amazon Bedrock
    6. Save AI reply to DB
    7. Return response
    """
    import json, boto3

    # ── 1. Verify conversation belongs to current user ────────
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # ── Auto-set title from first message ─────────────────────
    if conversation.title is None:
        raw = request.question.strip()
        conversation.title = (raw[:47] + "...") if len(raw) > 50 else raw

    # ── 2. Save user message ──────────────────────────────────
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.question,
    )
    db.add(user_msg)
    db.flush()  # get id without commit

    # ── 3. Load previous messages (history) ───────────────────
    history = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id,
            Message.id != user_msg.id,
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    # ── 4. Build messages array for Bedrock Converse API ──────
    bedrock_messages = []
    for msg in history:
        bedrock_messages.append({
            "role": msg.role,  # "user" or "assistant"
            "content": [{"text": msg.content}],
        })
    # Add current user message
    bedrock_messages.append({
        "role": "user",
        "content": [{"text": request.question}],
    })

    system_prompt = (
        "You are KelanaAI, an expert travel assistant. "
        "Help users plan trips, suggest destinations, estimate budgets, "
        "and give practical travel advice. Be concise, friendly, and specific."
    )

    # ── 5. Call Amazon Bedrock ────────────────────────────────
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")
    aws_region = os.getenv("AWS_REGION", "ap-southeast-2")

    bedrock = boto3.client("bedrock-runtime", region_name=aws_region)

    request_body = {
        "system": [{"text": system_prompt}],
        "messages": bedrock_messages,
        "inferenceConfig": {
            "maxTokens": 1024,
            "temperature": 0.7,
        },
    }

    response = bedrock.invoke_model(
        modelId=model_id,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(request_body),
    )
    response_body = json.loads(response["body"].read())
    answer = response_body["output"]["message"]["content"][0]["text"]

    # ── 6. Save AI reply ──────────────────────────────────────
    ai_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=answer,
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(conversation)
    db.refresh(user_msg)
    db.refresh(ai_msg)

    # ── 7. Return response ────────────────────────────────────
    return {
        "conversation_id": conversation_id,
        "title": conversation.title,
        "user_message": {
            "id":         user_msg.id,
            "role":       user_msg.role,
            "content":    user_msg.content,
            "created_at": user_msg.created_at,
        },
        "ai_message": {
            "id":         ai_msg.id,
            "role":       ai_msg.role,
            "content":    answer,
            "created_at": ai_msg.created_at,
        },
    }


class UpdateTitleRequest(BaseModel):
    title: str


@app.patch("/api/v1/conversations/{conversation_id}")
def update_title(
    conversation_id: int,
    request: UpdateTitleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rename a conversation title."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to rename this conversation")

    conversation.title = request.title.strip()
    db.commit()
    db.refresh(conversation)
    return {
        "id":         conversation.id,
        "title":      conversation.title,
        "created_at": conversation.created_at,
    }


@app.get("/api/v1/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages in a conversation."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "conversation_id": conversation_id,
        "title":           conversation.title,
        "messages": [
            {
                "id":         m.id,
                "role":       m.role,
                "content":    m.content,
                "created_at": m.created_at,
            }
            for m in conversation.messages
        ],
    }






# ── Trips ─────────────────────────────────────────────────────
@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    ai_recommendation = None
    try:
        ai_recommendation = get_ai_recommendation(
            destination=request.destination,
            days=request.days,
            budget=request.budget,
            travel_style=request.travel_style,
        )
    except Exception as e:
        print(f"[Bedrock] ERROR: {type(e).__name__}: {e}")

    trip = Trip(
        user_id           = current_user.id,
        destination       = request.destination,
        days              = request.days,
        budget            = request.budget,
        category          = category,
        travel_style      = request.travel_style,
        daily_budget      = daily_budget,
        ai_recommendation = ai_recommendation,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@app.post("/api/v1/trips/{trip_id}/generate")
def generate_recommendation(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id,
    ).first()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")

    trip.ai_recommendation = get_ai_recommendation(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        travel_style=trip.travel_style,
    )
    db.commit()
    db.refresh(trip)
    return trip


@app.get("/api/v1/trips")
def list_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Trip).filter(Trip.user_id == current_user.id).all()


@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id,
    ).first()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    return trip


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    request: TripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this trip")

    trip.destination  = request.destination
    trip.days         = request.days
    trip.budget       = request.budget
    trip.travel_style = request.travel_style
    trip.category     = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, request.days)
    db.commit()
    db.refresh(trip)
    return trip


@app.delete("/api/v1/trips/{trip_id}", status_code=204)
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this trip")

    db.delete(trip)
    db.commit()


# ── Other ─────────────────────────────────────────────────────
@app.get("/api/v1/recommendations")
def recommendation_places(destination: str):
    return {"places": get_recommendation_places(destination)}


@app.get("/api/v1/transportations")
def transportations():
    return {"transportation": list_transportation()}
