from services.trip_service import (
    calculate_daily_budget, 
    get_trip_category, 
    get_travel_season, 
    get_recommendation_places
)

def print_destination(destination):
    print(f"Destination     : {destination}")

def print_recommendation_places(destination):
    print("Recommended Places")
    for place in get_recommendation_places(destination):
        print(f"- {place}")
    print()

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