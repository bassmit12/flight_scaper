// src/services/FlightScraperService.js
const axios = require("axios");
const { RAPID_API_KEY } = require("../config/constants");
const Flight = require("../database/models/Flight");
const logger = require("../utils/logger");

class FlightScraperService {
  constructor() {
    this.headers = {
      "x-rapidapi-key": RAPID_API_KEY,
      "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    };
    this.airports = {
      AMSTERDAM: "AMS",
      ALICANTE: "ALC",
    };
  }

  async getNextSaturdays(count = 12) {
    const saturdays = [];
    const today = new Date();
    let nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));

    for (let i = 0; i < count; i++) {
      saturdays.push(new Date(nextSaturday));
      nextSaturday.setDate(nextSaturday.getDate() + 7);
    }

    return saturdays.map((date) => date.toISOString().split("T")[0]);
  }

  async getAirportEntityId(airportCode) {
    try {
      const url = "https://sky-scanner3.p.rapidapi.com/flights/airports";
      const response = await axios.get(url, { headers: this.headers });

      if (response.status === 200) {
        const airport = response.data.data.find(
          (airport) => airport.iata === airportCode,
        );
        return airport?.id;
      }
      return null;
    } catch (error) {
      logger.error("Error getting airport ID:", error);
      throw error;
    }
  }

  async searchFlights(fromEntityId, toEntityId, departureDate, direction) {
    try {
      const url = "https://sky-scanner3.p.rapidapi.com/flights/search-one-way";
      const response = await axios.get(url, {
        headers: this.headers,
        params: {
          fromEntityId,
          toEntityId,
          departDate: departureDate,
          cabinClass: "economy",
          adults: 1,
          market: "NL",
          locale: "nl-NL",
          currency: "EUR",
          sort: "cheapest_first",
        },
      });

      if (response.status === 200) {
        const flights = this.extractTransaviaFlights(
          response.data.data,
          direction,
        );

        for (const flight of flights) {
          await Flight.create(flight);
        }

        return flights;
      }
      return [];
    } catch (error) {
      logger.error("Error searching flights:", error);
      throw error;
    }
  }

  extractTransaviaFlights(data, direction) {
    const transaviaFlights = [];

    for (const itinerary of data.itineraries || []) {
      const legs = itinerary.legs || [];
      if (legs.length === 1) {
        try {
          const carrier = legs[0].carriers.marketing[0].name;
          if (carrier.toLowerCase() === "transavia") {
            transaviaFlights.push({
              fromAirport: legs[0].origin.name,
              toAirport: legs[0].destination.name,
              departureDate: legs[0].departure,
              price: parseFloat(itinerary.price.raw),
              carrier: carrier,
              direction: direction,
            });
          }
        } catch (error) {
          continue;
        }
      }
    }

    return transaviaFlights;
  }

  async fetchAllSaturdayFlights() {
    try {
      const saturdays = await this.getNextSaturdays();
      const amsId = await this.getAirportEntityId(this.airports.AMSTERDAM);
      const alcId = await this.getAirportEntityId(this.airports.ALICANTE);

      for (const saturday of saturdays) {
        // Fetch outbound flights (AMS -> ALC)
        await this.searchFlights(amsId, alcId, saturday, "outbound");

        // Fetch return flights (ALC -> AMS)
        await this.searchFlights(alcId, amsId, saturday, "return");

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return true;
    } catch (error) {
      logger.error("Error fetching Saturday flights:", error);
      return false;
    }
  }
}

module.exports = FlightScraperService;
