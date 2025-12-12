const Building = require("../models/building.model");

async function generateBuildingId() {
      let id;
      let exists = true;

      while (exists) {
            id = "BLD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            exists = await Building.exists({ buildingId: id });
      }
      return id;
}

module.exports = { generateBuildingId };
