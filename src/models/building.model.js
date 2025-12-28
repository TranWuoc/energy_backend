const mongoose = require("mongoose");
const { BUILDING_TYPE } = require("../constant/buildingTypes");

const SPACE_ZONE_CODES = ["administration", "meeting", "lobby", "corridor_wc", "security", "other"];

// Time range used to describe operation schedule of a system/zone.
// Recommended format: "HH:mm" (24h).
// Optional because many buildings do not have complete schedules at data-entry time.
const TimeRangeSchema = new mongoose.Schema(
      {
            from: { type: String, default: null },
            to: { type: String, default: null }
      },
      { _id: false }
);

const GovernmentOfficeZoneOperationSchema = new mongoose.Schema(
      {
            zoneCode: {
                  type: String,
                  required: true,
                  enum: ["administration", "meeting", "lobby", "corridor_wc", "security"]
            },
            hvac: { type: TimeRangeSchema, default: {} },
            lighting: { type: TimeRangeSchema, default: {} },
            waterHeating: { type: TimeRangeSchema, default: {} },
            camera: { type: TimeRangeSchema, default: {} }
      },
      { _id: false }
);

const CommercialOfficeZoneOperationSchema = new mongoose.Schema(
      {
            zoneCode: {
                  type: String,
                  required: true,
                  enum: [
                        "rental_office",
                        "meeting",
                        "lobby",
                        "corridor_wc",
                        "security",
                        "canteen_fnb",
                        "commercial_area",
                        "indoor_parking"
                  ]
            },
            hvac: { type: TimeRangeSchema, default: {} },
            lighting: { type: TimeRangeSchema, default: {} },
            waterHeating: { type: TimeRangeSchema, default: {} },
            camera: { type: TimeRangeSchema, default: {} }
      },
      { _id: false }
);

const BuildingGeneralSchema = new mongoose.Schema(
      {
            name: { type: String, required: true },
            address: { type: String, required: true },
            owner: { type: String },

            buildingType: {
                  type: Number,
                  required: true,
                  enum: BUILDING_TYPE
            },

            // Year the building started operation (used for filtering / context, not in EP formula).
            commissioningYear: { type: Number, min: 1900, max: 3000 },

            hasHVAC: { type: Boolean, default: false },
            hasLighting: { type: Boolean, default: false },
            hasWaterHeating: { type: Boolean, default: false },
            otherSystems: { type: String },

            setpointTemperature: { type: Number },
            setpointHumidity: { type: Number },
            setpointLightingLevel: { type: Number },

            governmentSystemZones: [GovernmentOfficeZoneOperationSchema],
            commercialOfficeZones: [CommercialOfficeZoneOperationSchema],

            controlSystemType: { type: String },

            // Benchmarking grouping (must be consistent for comparable entities)
            climateZone: { type: String },

            // Optional sub-areas used for EP normalization (G.2)
            outdoorParkingArea: { type: Number, default: 0, min: 0 }, // CPA (outside building)
            dataCenterArea: { type: Number, default: 0, min: 0 }, // DCA

            totalFloorArea: { type: Number, required: true }, // GFA
            aboveGroundFloorArea: { type: Number, required: true },
            basementFloorArea: { type: Number, required: true },

            indoorParkingArea: { type: Number, default: 0, min: 0 },
            nonRentableArea: { type: Number, default: 0, min: 0 },
            totalRentableArea: { type: Number, default: 0, min: 0 },
            vacantArea: { type: Number, default: 0, min: 0 }
      },
      { _id: false }
);

const SpaceZoneOperationSchema = new mongoose.Schema(
      {
            zoneCode: {
                  type: String,
                  required: true,
                  enum: SPACE_ZONE_CODES
            },

            // Space operation schedule (optional)
            weekday: { type: TimeRangeSchema, default: {} },
            saturday: { type: TimeRangeSchema, default: {} },
            sunday: { type: TimeRangeSchema, default: {} },

            utilisationLevel: { type: String, default: null }, // Mức độ sử dụng
            averagePeople: { type: Number, default: 0, min: 0 }, // Số người trung bình
            note: { type: String, default: null }
      },
      { _id: false }
);

const BuildingOperationSchema = new mongoose.Schema(
      {
            spaceZones: [SpaceZoneOperationSchema]
      },
      { _id: false }
);

function validateFullYearMonthlyEntries(entries) {
      if (!entries || entries.length === 0) {
            return true; // allow empty, change logic if needed
      }

      const grouped = {};

      // Group months by year
      entries.forEach((e) => {
            const y = e.year;
            if (!grouped[y]) grouped[y] = [];
            grouped[y].push(e.month);
      });

      for (const year in grouped) {
            const months = grouped[year];

            // Must have exactly 12 entries
            if (months.length !== 12) return false;

            // Must have all months 1–12, no duplicates
            const monthSet = new Set(months);
            if (monthSet.size !== 12) return false;
            for (let m = 1; m <= 12; m++) {
                  if (!monthSet.has(m)) return false;
            }
      }

      return true;
}

const ElectricityConsumptionSchema = new mongoose.Schema(
      {
            year: { type: Number, required: true },
            month: { type: Number, required: true, min: 1, max: 12 },
            energyConsumption: { type: Number, required: true, min: 0 }, // in kWh

            dataSource: {
                  type: Number,
                  required: true,
                  enum: [1, 2]
            }
      },
      { _id: false }
);

const SolarEnergySchema = new mongoose.Schema(
      {
            isSelected: { type: Boolean, default: false },
            installedArea: { type: Number, min: 0 }, // m²
            installedCapacity: { type: Number, min: 0 }, // kWp
            averageEfficiency: { type: Number, min: 0 }, // %
            averageSunHoursPerYear: { type: Number, min: 0 }, // giờ/năm
            systemLosses: { type: Number, min: 0 } // %
      },
      { _id: false }
);

const WindEnergySchema = new mongoose.Schema(
      {
            isSelected: { type: Boolean, default: false },
            turbineCount: { type: Number, min: 0 }, // cái
            turbineCapacity: { type: Number, min: 0 }, // kWp mỗi turbine
            averageWindSpeed: { type: Number, min: 0 }, // m/s
            operatingHoursPerYear: { type: Number, min: 0 }, // giờ/năm
            capacityFactor: { type: Number, min: 0 } // %
      },
      { _id: false }
);

const GeothermalEnergySchema = new mongoose.Schema(
      {
            isSelected: { type: Boolean, default: false },
            installedCapacity: { type: Number, min: 0 }, // kWp
            sourceTemperature: { type: Number }, // °C
            operatingHoursPerYear: { type: Number, min: 0 }, // giờ/năm
            systemCOP: { type: Number, min: 0 } // %
      },
      { _id: false }
);

const RenewableProductionSchema = new mongoose.Schema(
      {
            year: { type: Number, required: true },
            solar: SolarEnergySchema,
            wind: WindEnergySchema,
            geothermal: GeothermalEnergySchema
      },
      { _id: false }
);

const BuildingSchema = new mongoose.Schema({
      buildingId: { type: String, required: true, unique: true },

      generalInfo: { type: BuildingGeneralSchema, required: true },
      operation: { type: BuildingOperationSchema, default: {} },
      // Điện tiêu thụ (bắt buộc mỗi năm đủ 12 tháng)
      consumedElectricity: {
            type: [ElectricityConsumptionSchema],
            validate: {
                  validator: function (entries) {
                        return validateFullYearMonthlyEntries(entries);
                  },
                  message: "Mỗi năm trong năng lượng tiêu thụ phải bao gồm đầy đủ 12 tháng (1–12) và không được trùng tháng."
            }
      },

      // Điện sản xuất (tái tạo)
      producedElectricity: [RenewableProductionSchema],

      createdAt: { type: Date, default: Date.now }
});

const Building = mongoose.model("Building", BuildingSchema);

module.exports = Building;
