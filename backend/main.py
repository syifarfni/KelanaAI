from services.trip_service import (
    calculate_daily_budget, 
    get_trip_category, 
    get_travel_season,
    get_transportation_recommendation, 
    get_recommendation_places,
    list_transportation
)
from fastapi import FastAPI 
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def home():
    return {
        "message" : "Hai Syifa From KelanaAI"
    }

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )
    category = get_trip_category(
        request.budget
    )
    return {
        "destination"   :  request.destination,
        "budget"    :   request.budget,
        "daily_budget"  : daily_budget,
        "category"  :   category,
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