const mongoose = require("mongoose");
async function getEnergyPerformanceList(req, res, next) {
      try {
            const { buildingId, year } = req.query;

            const filter = {};
            if (buildingId) filter.buildingId = buildingId;
            if (year) filter.year = Number(year);

            const col = mongoose.connection.collection("energy_performances");

            const results = await col.find(filter).sort({ buildingId: 1, year: -1 }).toArray();

            // Kiểm tra nếu có filter nhưng không tìm thấy kết quả
            if (results.length === 0 && Object.keys(filter).length > 0) {
                  return res.status(404).json({
                        message: "No energy performance data found matching the specified criteria",
                        filter: filter
                  });
            }

            return res.json({
                  total: results.length,
                  data: results
            });
      } catch (err) {
            next(err);
      }
}

async function getEnergyPerformanceByBuildingId(req, res, next) {
      try {
            const { buildingId } = req.params;

            if (!buildingId) {
                  return res.status(400).json({ message: "buildingId is required" });
            }

            const col = mongoose.connection.collection("energy_performances");

            const results = await col.find({ buildingId }).sort({ year: -1 }).toArray();

            if (results.length === 0) {
                  return res.status(404).json({
                        message: "No energy performance data found for the specified buildingId"
                  });
            }

            return res.json({
                  total: results.length,
                  data: results
            });
      } catch (err) {
            next(err);
      }
}

module.exports = {
      getEnergyPerformanceList,
      getEnergyPerformanceByBuildingId
};
