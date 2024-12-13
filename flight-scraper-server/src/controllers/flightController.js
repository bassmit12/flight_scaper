// src/controllers/flightController.js
const FlightScraperService = require("../services/FlightScraperService");
const Flight = require("../database/models/Flight");
const logger = require("../utils/logger");

const scraper = new FlightScraperService();

exports.fetchSaturdayFlights = async (req, res) => {
  try {
    const success = await scraper.fetchAllSaturdayFlights();
    if (success) {
      res.json({ message: "Saturday flights fetched successfully" });
    } else {
      res.status(500).json({ error: "Error fetching Saturday flights" });
    }
  } catch (error) {
    logger.error("Error in fetchSaturdayFlights:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCheapestOutboundFlights = async (req, res) => {
  try {
    const flights = await Flight.getCheapestFlightsByDirection("outbound");
    res.json({ data: flights });
  } catch (error) {
    logger.error("Error in getCheapestOutboundFlights:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCheapestReturnFlights = async (req, res) => {
  try {
    const flights = await Flight.getCheapestFlightsByDirection("return");
    res.json({ data: flights });
  } catch (error) {
    logger.error("Error in getCheapestReturnFlights:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
