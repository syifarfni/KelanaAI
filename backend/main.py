def print_trip_summary(destination, country, days, budget, travel_month):
    print("="*28)
    print("KELANA AI - PLAN WITH US")
    print("="*28)
    print(f"Destination: {destination}")
    print(f"Country: {country}")
    print(f"Days: {days}")
    print(f"Budget: {budget:.0f} {currency}")
    print(f"Currency: {currency}")
    print(f"Travel_Month: {travel_month}")
    
destination = input("Where do you wanna go? :")
country = input("Which country? : " )
days = int(input("How many days? : "))
budget = float(input("How much your budget? : "))
currency = input("Currency (USD/IDR/etc) : ").upper()
travel_month = input("Travel month? : ")

print_trip_summary(destination,country, days, budget, travel_month)