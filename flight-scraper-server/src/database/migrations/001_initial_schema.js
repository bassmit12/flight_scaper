// src/database/migrations/001_initial_schema.js
const db = require("../../config/database");
const logger = require("../../utils/logger");

const createTables = () => {
  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS flights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_airport TEXT NOT NULL,
        to_airport TEXT NOT NULL,
        departure_date TEXT NOT NULL,
        price REAL NOT NULL,
        carrier TEXT NOT NULL,
        direction TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) {
          logger.error("Error creating flights table:", err);
          process.exit(1);
        }
        logger.info("Flights table created successfully");
      },
    );
  });
};

createTables();
