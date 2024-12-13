require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  RAPID_API_KEY: process.env.RAPID_API_KEY,
  DATABASE_PATH: process.env.DATABASE_PATH,
};
