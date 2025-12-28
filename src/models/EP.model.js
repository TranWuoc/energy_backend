const mongoose = require("mongoose");

const EnergyPerformanceSchema = new mongoose.Schema(
      {
            buildingId: { type: String, required: true, index: true },
            year: { type: Number, required: true, index: true },

            ep: { type: Number, required: true },

            inputs: { type: Object, default: {} },
            normalised: { type: Object, default: {} },

            ruleVersion: { type: String, default: "EP_v1_vacantArea_over_GLA" },
            computedAt: { type: Date, default: Date.now }
      },
      { timestamps: true }
);

EnergyPerformanceSchema.index({ buildingId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("EnergyPerformance", EnergyPerformanceSchema);
