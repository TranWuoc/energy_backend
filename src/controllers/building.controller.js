const buildingService = require("../services/building.service");

// Create a new building
async function createBuilding(req, res, next) {
  try {
    const building = await buildingService.createBuilding(req.body);
    return res.status(201).json(building);
  } catch (error) {
    return next(error);
  }
}

// Get all building
async function getBuildingById(req, res, next) {
  try {
    const building = await buildingService.listBuilding();
    return res.json(building);
  } catch (error) {
    return next(error);
  }
}

// Get building by ID
async function getBuilding(req, res, next) {
  try {
    const result = await buildingService.getBuildingById(req.params.buildingId);
    if (!result) {
      return res.status(404).json({ message: "Building not found" });
    }
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

// Update building by ID
async function updateBuilding(req, res, next) {
  try {
    const updatedBuilding = await buildingService.updateBuilding(req.params.buildingId, req.body);
    if (!updatedBuilding) {
      return res.status(404).json({ message: "Building not found" });
    }
    return res.json(updatedBuilding);
  } catch (error) {
    return next(error);
  }
}

// Delete building by ID
async function deleteBuilding(req, res, next) {
  try {
    const deleted = await buildingService.deleteBuilding(req.params.buildingId);
    if (!deleted) {
      return res.status(404).json({ message: "Building not found" });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBuilding,
  getBuildingById,
  getBuilding,
  updateBuilding,
  deleteBuilding
};
