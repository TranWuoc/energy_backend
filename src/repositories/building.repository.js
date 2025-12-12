const Building = require("../models/building.model");

async function createBuilding(data) {
      const doc = await Building.create(data);
      return doc;
}

async function getAllBuildings() {
      return Building.find().lean();
}

async function getBuildingById(id) {
      return Building.findById(id).lean();
}

async function updateBuilding(id, data) {
      return Building.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deleteBuilding(id) {
      return Building.findByIdAndDelete(id).lean();
}

module.exports = {
      createBuilding,
      getAllBuildings,
      getBuildingById,
      updateBuilding,
      deleteBuilding
};
