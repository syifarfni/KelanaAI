from services.trip_services import (
    calculate_daily_budget, 
    get_trip_category, 
    get_travel_season,
    get_transportation_recommendation, 
    get_recommendation_places,
    list_transportation
)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import init_db
from models.trip import Trip
from database import SessionLocal, init_db


app = FastAPI()
init_db()




@app.get("/")
def home():
    return {
        "message" : "Hai Syifa From KelanaAI"
    }

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float



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

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    # reuse Session 2 business logic
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    # create a Trip ORM object
    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        daily_budget = daily_budget,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
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


def print_destination(destination):
    print(f"Destination = {destination}")


def print_trip_summary(destination, days, budget, month):
    daily_budget = calculate_daily_budget(budget, days)
    category = get_trip_category(budget)
    season = get_travel_season(month)

    print("=" * 28)
    print("KelanaAI")
    print("=" * 28)
    print()
    print_destination(destination)
    print(f"Days        = {days}")
    print(f"Budget      = {budget} USD")
    print(f"Category    = {category}")
    print(f"Daily budget= {daily_budget:.0f} USD/Day")
    print(f"Travel Month= {month}")
    print(f"Season      = {season}")
    print()
    print_recommendation_places(destination)


# Panggil fungsi dengan string biasa (bukan list)
print_trip_summary("Japan", 5, 1500, "December")


