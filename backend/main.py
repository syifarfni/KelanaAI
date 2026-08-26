from services.trip_services import (
    calculate_daily_budget, 
    get_trip_category, 
    get_travel_season,
    get_transportation_recommendation, 
    get_recommendation_places,
    list_transportation
)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import init_db
from models.trip import Trip
from database import SessionLocal, init_db
from services.bedrock_service import get_ai_recommendation


app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.get("/")
def home():
    return {
        "message" : "Hai Syifa From KelanaAI"
    }

@app.get("/health")
def home():
    return {
        "Status" : "OK"
    }



@app.get("/api/v1/recommendations")
def print_recommendation_places(destination):
    places = get_recommendation_places(destination)
    return {
        "places"   :    places   
    }

@app.get("/api/v1/transportations")
def print_list_transportation():
    transport = list_transportation()
    return {
        "transportation" : transport 
    }

class TripRequest(BaseModel):
    destination: str
    days:       int
    budget:     float
    travel_style: str


@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    # reuse Session 2 business logic
    daily_budget = calculate_daily_budget(
        request.budget, 
        request.days
        )
    category     = get_trip_category(
        request.budget
        )
    
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
    
    # create a Trip ORM object
    trip = Trip(
        destination       = request.destination,
        days              = request.days,
        budget            = request.budget,
        category          = category,
        travel_style      = request.travel_style,
        daily_budget      = daily_budget,
        ai_recommendation = ai_recommendation,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)   
    db.close()
    return trip

@app.post("/api/v1/trips/{trip_id}/generate")
def generate_recommendation(trip_id: int):
    db = SessionLocal()
    trip =db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        db.close()
        raise HTTPException(
            status_code = 404, 
            detail = f"Trip with id {trip_id} not found"
        )

    ai_recommendation = get_ai_recommendation(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        travel_style=trip.travel_style,
    )

    trip.ai_recommendation = ai_recommendation

    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
  # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest):
    
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
  # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)
    
    trip.budget = request.budget
    trip.destination = request.destination
    trip.days = request.days
    trip.category = category
    trip.daily_budget = daily_budget
    db.commit()
    db.refresh(trip)   
    db.close()
    return trip

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
  # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    db.delete(trip)
    db.commit()
    db.close()
    return trip


# def print_destination(destination):
#     print(f"Destination = {destination}")


# def print_trip_summary(destination, days, budget, month):
#     daily_budget = calculate_daily_budget(budget, days)
#     category = get_trip_category(budget)
#     season = get_travel_season(month)

#     print("=" * 28)
#     print("KelanaAI")
#     print("=" * 28)
#     print()
#     print_destination(destination)
#     print(f"Days        = {days}")
#     print(f"Budget      = {budget} USD")
#     print(f"Category    = {category}")
#     print(f"Daily budget= {daily_budget:.0f} USD/Day")
#     print(f"Travel Month= {month}")
#     print(f"Season      = {season}")
#     print()
#     print_recommendation_places(destination)


# # Panggil fungsi dengan string biasa (bukan list)
# print_trip_summary("Japan", 5, 1500, "December")


