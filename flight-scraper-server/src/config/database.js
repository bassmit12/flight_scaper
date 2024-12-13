// Flight-scraper/flight-scraper-server/src/config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { DATABASE_PATH } = require("./constants");
const logger = require("../utils/logger");

// Ensure we're using an absolute path for the database
const dbPath = path.resolve(process.cwd(), DATABASE_PATH || "flight_data.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error("Error connecting to database:", err);
    throw err;
  }
  logger.info(`Connected to SQLite database at ${dbPath}`);
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

module.exports = db;
