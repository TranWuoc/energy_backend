// src/scripts/test-ep.js
require("dotenv").config();
const mongoose = require("mongoose");

const Building = require("../models/building.model"); // model mongoose
const ep = require("../helper/ep.calculator");

async function main() {
      await mongoose.connect(process.env.MONGO_URI);

      const buildingId = "BLD-EL7J2Z"; // của bạn
      const building = await Building.findOne({ buildingId }).lean();

      if (!building) {
            console.error("Không tìm thấy building:", buildingId);
            process.exit(1);
      }

      // Test 1 năm cụ thể
      const result2023 = ep.computeEnergyPerformanceForYear(building, 2023, {
            // AWH/WOH optional. Không truyền thì TF=1
            // AWH: 2080,
            // WOH: 2080,
      });

      console.log("EP 2023 =", result2023);

      // Test tất cả năm có đủ 12 tháng
      const all = ep.computeEnergyPerformanceAllYears(building);
      console.log("EP all years =", all);

      await mongoose.disconnect();
}

main().catch((err) => {
      console.error("TEST EP FAILED:", err.message);
      if (err.details) console.error("DETAILS:", err.details);
      process.exit(1);
});
