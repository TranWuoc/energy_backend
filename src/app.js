require("dotenv").config();

const express = require("express");
const cors = require("cors");

const buildingRoutes = require("./routes/building.routes");
const energyPerformanceRoutes = require("./routes/EP.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/energy-performances", energyPerformanceRoutes);

app.use(errorHandler);

module.exports = app;
