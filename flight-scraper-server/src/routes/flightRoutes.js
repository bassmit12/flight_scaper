// src/routes/flightRoutes.js
const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flightController");

router.get("/test", (req, res) => {
  res.json({ message: "Backend connection successful!" });
});

router.post("/fetch-saturday-flights", flightController.fetchSaturdayFlights);
router.get("/cheapest-outbound", flightController.getCheapestOutboundFlights);
router.get("/cheapest-return", flightController.getCheapestReturnFlights);

module.exports = router;
