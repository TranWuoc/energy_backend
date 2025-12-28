const EnergyPerformance = require("../models/EP.model");

async function upsertMany(results = []) {
      const ops = results.map((r) => ({
            updateOne: {
                  filter: { buildingId: r.buildingId, year: r.year },
                  update: { $set: { ...r, computedAt: new Date() } },
                  upsert: true
            }
      }));

      if (ops.length === 0) return [];
      await EnergyPerformance.bulkWrite(ops);

      const docs = await EnergyPerformance.find({ buildingId: results[0].buildingId })
            .populate("buildingId", "generalInfo.name") // ✅ Lấy toàn bộ building document
            .lean();

      // ✅ Transform: Flatten buildingId object
      return docs.map((doc) => ({
            ...doc,
            buildingName: doc.buildingId?.generalInfo?.name || null,
            buildingId: doc.buildingId?._id?.toString() || doc.buildingId
      }));
}

module.exports = { upsertMany };
