const mongoose = require("mongoose");
const buildingService = require("../services/building.service");

// POST /api/buildings
async function createBuilding(req, res, next) {
      try {
            const building = await buildingService.createBuilding(req.body);
            return res.status(201).json(building);
      } catch (err) {
            next(err);
      }
}

// GET /api/buildings
async function getAllBuildings(req, res, next) {
      try {
            const buildings = await buildingService.listBuildings();
            return res.json(buildings);
      } catch (err) {
            next(err);
      }
}

// GET /api/buildings/:buildingId
async function getBuildingById(req, res, next) {
      try {
            const { buildingId } = req.params;
            const building = await buildingService.getBuildingDetail(buildingId);
            return res.json(building);
      } catch (err) {
            next(err);
      }
}

async function getDetailBuilding(req, res, next) {
      try {
            const { buildingId } = req.params;
            const building = await buildingService.getBuildingDetail(buildingId);
            return res.json(building);
      } catch (err) {
            next(err);
      }
}

// Update PUT /api/buildings/:buildingId
async function updateBuilding(req, res, next) {
      try {
            const { buildingId } = req.params;
            const updated = await buildingService.updateBuilding(buildingId, req.body);
            return res.json(updated);
      } catch (err) {
            next(err);
      }
}

// DELETE /api/buildings/:buildingId
async function deleteBuilding(req, res, next) {
      try {
            const { buildingId } = req.params;
            const result = await buildingService.removeBuilding(buildingId);
            return res.json(result);
      } catch (err) {
            next(err);
      }
}

module.exports = {
      createBuilding,
      getBuildingById,
      getDetailBuilding,
      getAllBuildings,
      updateBuilding,
      deleteBuilding
};
