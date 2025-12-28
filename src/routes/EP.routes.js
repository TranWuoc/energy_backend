const express = require("express");
const router = express.Router();

const energyPerformanceController = require("../controllers/EP.controller");

// GET /api/energy-performances
router.get("/", energyPerformanceController.getEnergyPerformanceList);

module.exports = router;
