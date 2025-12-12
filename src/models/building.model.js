const mongoose = require("mongoose");

const BUILDING_TYPE_MAP = {
      1: "Văn phòng công sở nhà nước",
      2: "Văn phòng thương mại"
};

const ELECTRIC_DATA_SOURCES_MAP = {
      1: "Hoá đơn điện hàng tháng",
      2: "Công tơ điện / báo cáo kiểm toán"
};

const SPACE_ZONE_CODES = [
      "administration",
      "meeting",
      "looby",
      "corridor_wc",
      "security",
      "orther"
];

const TimeRangeSchema = new mongoose.Schema(
      {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true }
      },
      { _id: false }
);

const GovernmentOfficeZoneOperationSchema = new mongoose.Schema(
      {
            zoneCode: {
                  type: String,
                  required: true,
                  enum: ["administration", "meeting", "looby", "corridor_wc", "security"]
            },
            hvac: TimeRangeSchema,
            lighting: TimeRangeSchema,
            waterHeating: TimeRangeSchema,
            camera: TimeRangeSchema
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
            hvac: TimeRangeSchema,
            lighting: TimeRangeSchema,
            waterHeating: TimeRangeSchema,
            camera: TimeRangeSchema
      },
      { _id: false }
);

const BuildingGeneralSchema = new mongoose.Schema(
      {
            name: { type: String, required: true },
            address: { type: String, required: true },
            owner: { type: string },

            buildingType: {
                  type: Number,
                  require: true,
                  enum: [1, 2]
            },

            commingYear: { type: Number },

            hasHVAC: { type: string },
            hasLinghting: { type: string },
            hasWaterHeating: { type: string },
            otherSystems: { type: String },

            setpointTemperature: { type: Number },
            setpointHumidity: { type: Number },
            setpontLightingLevel: { type: Number },

            governmentSystemZones: [GovernmentOfficeZoneOperationSchema],
            commercialOfficeZones: [CommercialOfficeZoneOperationSchema],

            controlSystemType: { type: String },

            totalFloorArea: { type: Number, required: true },
            aboveGroundFloorArea: { type: Number, required: true },
            basmentFloorArea: { type: Number, required: true },
            indoorParkingArea: { type: Number, required: true },
            nonRentableArea: { type: Number, required: true },
            totalRentableArea: { type: Number, required: true },
            vacantArea: { type: Number, required: true }
      },
      { _id: false }
);

const SpaceZoneOperationSchema = new mongoose.Schema({
      zoneCode: {
            type: String,
            required: true,
            enum: SPACE_ZONE_CODES
      },

      weekDay: TimeRangeSchema,
      saturday: TimeRangeSchema,
      sunday: TimeRangeSchema,

      utilisationLevel: { type: String }, // Mức độ sử dụng
      averagePeople: { type: Number }, // Số người trung bình
      note: { type: String }
});

const BuildingOperationSchema = new mongoose.Schema(
      {
            spaceZones: [SpaceZoneOperationSchema]
      },
      { _id: false }
);

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

      generalInfo: { type: BuildingGeneralInfoSchema, required: true },
      operation: BuildingOperationSchema,

      // Điện tiêu thụ (bắt buộc mỗi năm đủ 12 tháng)
      consumedElectricity: {
            type: [ElectricityConsumptionSchema],
            validate: {
                  validator: function (entries) {
                        if (!entries || entries.length === 0) {
                              return true; // cho phép rỗng, nếu muốn bắt buộc thì đổi logic
                        }

                        const grouped = {};

                        // Gom tháng theo năm
                        entries.forEach((e) => {
                              const y = e.year;
                              if (!grouped[y]) grouped[y] = [];
                              grouped[y].push(e.month);
                        });

                        for (const year in grouped) {
                              const months = grouped[year];

                              // Phải có đúng 12 entry
                              if (months.length !== 12) return false;

                              // Phải đủ 1–12, không trùng
                              const monthSet = new Set(months);
                              if (monthSet.size !== 12) return false;
                              for (let m = 1; m <= 12; m++) {
                                    if (!monthSet.has(m)) return false;
                              }
                        }

                        return true;
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
module.exports.BUILDING_TYPE_MAP = BUILDING_TYPE_MAP;
module.exports.ELECTRICITY_DATA_SOURCE_MAP = ELECTRICITY_DATA_SOURCE_MAP;
