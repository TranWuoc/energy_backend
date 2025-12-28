const Building = require("../models/building.model");

async function createBuilding(data) {
      const doc = await Building.create(data);
      return doc;
}

async function getAllBuildings() {
      return Building.find().lean();
}

async function getDetailBuilding(buildingId) {
      return Building.findOne({ buildingId }).lean();
}

async function updateBuilding(buildingId, data) {
      return Building.findOneAndUpdate({ buildingId }, data, {
            new: true,
            runValidators: true
      }).lean();
}

async function deleteBuilding(buildingId) {
      return Building.findOneAndDelete({ buildingId }).lean();
}

module.exports = {
      createBuilding,
      getAllBuildings,
      getDetailBuilding,
      updateBuilding,
      deleteBuilding
};
