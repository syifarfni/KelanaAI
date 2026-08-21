def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standar"
    else:
        return "Luxury"

def calculate_daily_budget(budget,days):
    return budget/days

def get_travel_season(month):
    if month == "desember":
        return "Peak Season"
    elif month == "June":
        return "Holiday Season"
    else:
        return "Regular Season"

def get_transportation_recommendation(category):
    if category == "Backpacker":
        return "Bus"
    elif category == "Standar":
        return "Train"
    else:
        return "Flight"

def list_transportation():
    return ["Bus", "Train", "Flight"]

def get_recommendation_places(destination):
    recommendation = {
        "Japan" : ["Tokyo tower", "Shibuya", "Mount Fuji"],
        "Indonesia": ["Jakarta", "Banda Naira", "Pink Beach"],
        "Singapore": ["Marina Bay sanda", "Garden by the bay", "sentosa"]
    }

    if isinstance(destination, list):
        destination = destination[0]

    return recommendation.get(destination.capitalize(), ["City Center", "Local Market", "Popular Landmark"])