// server.js
const express = require("express");
const { PORT } = require("./src/config/constants");
const flightRoutes = require("./src/routes/flightRoutes");
const logger = require("./src/utils/logger");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/flights", flightRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
