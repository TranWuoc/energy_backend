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

async function deleteBuilding(buildingId, options = {}) {
      return Building.findOneAndDelete({ buildingId }, options);
}

module.exports = {
      createBuilding,
      getAllBuildings,
      getDetailBuilding,
      updateBuilding,
      deleteBuilding
};
