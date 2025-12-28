const mongoose = require("mongoose");
async function getEnergyPerformanceList(req, res, next) {
      try {
            const { buildingId, year } = req.query;

            const filter = {};
            if (buildingId) filter.buildingId = buildingId;
            if (year) filter.year = Number(year);

            const col = mongoose.connection.collection("energy_performances");

            const results = await col.find(filter).sort({ buildingId: 1, year: -1 }).toArray();

            return res.json({
                  total: results.length,
                  data: results
            });
      } catch (err) {
            next(err);
      }
}

module.exports = {
      getEnergyPerformanceList
};
