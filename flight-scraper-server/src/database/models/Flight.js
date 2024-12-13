// src/database/models/Flight.js
const db = require("../../config/database");
const logger = require("../../utils/logger");

class Flight {
  static async create(flightData) {
    return new Promise((resolve, reject) => {
      const {
        fromAirport,
        toAirport,
        departureDate,
        price,
        carrier,
        direction, // 'outbound' or 'return'
      } = flightData;

      db.run(
        `INSERT INTO flights (
          from_airport,
          to_airport,
          departure_date,
          price,
          carrier,
          direction,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [fromAirport, toAirport, departureDate, price, carrier, direction],
        function (err) {
          if (err) {
            logger.error("Error creating flight:", err);
            reject(err);
          }
          resolve(this.lastID);
        },
      );
    });
  }

  static async getCheapestFlightsByDirection(direction) {
    return new Promise((resolve, reject) => {
      db.all(
        `WITH MinPrices AS (
          SELECT
            DATE(departure_date) as flight_date,
            MIN(price) as min_price
          FROM flights
          WHERE direction = ?
          GROUP BY DATE(departure_date)
        ),
        RankedFlights AS (
          SELECT
            mp.flight_date as departure_date,
            mp.min_price as price,
            f.carrier,
            ROW_NUMBER() OVER (PARTITION BY DATE(f.departure_date) ORDER BY f.departure_date) as rn
          FROM MinPrices mp
          JOIN flights f ON DATE(f.departure_date) = mp.flight_date
            AND f.price = mp.min_price
            AND f.direction = ?
        )
        SELECT
          departure_date,
          price,
          carrier
        FROM RankedFlights
        WHERE rn = 1
        ORDER BY departure_date ASC`,
        [direction, direction],
        (err, rows) => {
          if (err) {
            logger.error("Error finding flights:", err);
            reject(err);
          }
          resolve(rows);
        },
      );
    });
  }
}

module.exports = Flight;
