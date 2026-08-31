from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import init_db, SessionLocal
from models.trip import Trip
from models.user import User
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
