import requests
import json
from datetime import datetime

class FlightScraper:
    def __init__(self):
        self.API_KEY = 'a617fe5e28msh2c1b49609b035a8p196836jsn7e669d879014'
        self.headers = {
            'x-rapidapi-key': self.API_KEY,
            'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com'
        }

    def get_airport_entity_id(self, airport_name):
        url = "https://sky-scanner3.p.rapidapi.com/flights/airports"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            airports_data = response.json()
            for airport in airports_data.get('data', []):
                if airport_name.lower() in airport.get('name').lower():
                    return airport.get('id')
        return None

    def format_date(self, date_str):
        return datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-%d")

    def search_flights(self, from_entity_id, to_entity_id, departure_date):
        url = "https://sky-scanner3.p.rapidapi.com/flights/search-one-way"

        params = {
            'fromEntityId': from_entity_id,
            'toEntityId': to_entity_id,
            'cabinClass': 'economy',
            'adults': 1,
            'market': 'NL',
            'locale': 'nl-NL',
            'currency': 'EUR',
            'departDate': self.format_date(departure_date),
            'sort': 'cheapest_first',
        }

        response = requests.get(url, headers=self.headers, params=params)

        if response.status_code == 200:
            flight_data = response.json()
            with open('one_way_flights.json', 'w') as json_file:
                json.dump(flight_data['data'], json_file, indent=4)
            return True
        return False

    def filter_transavia_flights(self):
        try:
            with open('one_way_flights.json', 'r', encoding='utf-8') as infile:
                data = json.load(infile)

            cheapest_transavia_flight = None
            lowest_price = float('inf')

            for itinerary in data.get('itineraries', []):
                legs = itinerary.get('legs', [])
                if len(legs) == 1:  # One-way flights have only one leg
                    try:
                        carrier = legs[0]['carriers']['marketing'][0]['name']
                        if carrier.lower() == 'transavia':
                            current_price = float(itinerary['price']['raw'])
                            if current_price < lowest_price:
                                lowest_price = current_price
                                cheapest_transavia_flight = itinerary
                    except (KeyError, IndexError):
                        continue

            if cheapest_transavia_flight:
                # Create new data structure with only the cheapest flight
                filtered_data = {
                    "context": data.get('context', {}),
                    "itineraries": [cheapest_transavia_flight],
                    "messages": data.get('messages', []),
                    "filterStats": data.get('filterStats', {})
                }

                with open('filtered_flights.json', 'w', encoding='utf-8') as outfile:
                    json.dump(filtered_data, outfile, ensure_ascii=False, indent=4)

                print(f"Cheapest Transavia flight found: €{lowest_price:.2f}")
                return True
            else:
                print("No Transavia flights found")
                return False

        except Exception as e:
            print(f"Error filtering flights: {e}")
            return False

def main():
    scraper = FlightScraper()

    # Get user input
    from_airport = input("Enter departure airport name (e.g., Schiphol): ")
    to_airport = input("Enter destination airport name (e.g., Alicante): ")
    departure_date = input("Enter departure date (YYYY-MM-DD): ")

    print("\nSearching for airport IDs...")
    from_entity_id = scraper.get_airport_entity_id(from_airport)
    to_entity_id = scraper.get_airport_entity_id(to_airport)

    if not from_entity_id or not to_entity_id:
        print("Could not find one or both airports. Please check the airport names.")
        return

    print("Searching for flights...")
    if scraper.search_flights(from_entity_id, to_entity_id, departure_date):
        print("Flight data retrieved successfully!")

        print("Filtering Transavia flights...")
        if scraper.filter_transavia_flights():
            print("Transavia flights have been filtered and saved to 'filtered_flights.json'")
        else:
            print("Error filtering Transavia flights")
    else:
        print("Error searching for flights")

if __name__ == "__main__":
    main()
