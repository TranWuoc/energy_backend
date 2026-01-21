const mongoose = require("mongoose");
const { BUILDING_TYPE, CONTROL_SYSTEM_TYPES } = require("../constant/buildingTypes");

const GOV_ZONE_CODES = [
      "admin_work", // Khu làm việc hành chính
      "hall_meeting", // Hội trường & phòng họp lớn
      "lobby_reception", // Sảnh chính & lễ tân
      "corridor_wc", // Hành lang, cầu thang bộ, khu vệ sinh
      "security", // Khu bảo vệ/ an ninh
      "indoor_parking" // Khu đỗ xe trong nhà
];

const COM_ZONE_CODES = [
      "rental_office", // Khu vực văn phòng cho thuê
      "hall_meeting", // Hội trường & phòng họp lớn
      "lobby_reception", // Sảnh chính & lễ tân
      "corridor_wc", // Hành lang, cầu thang bộ, khu vệ sinh
      "security", // Khu bảo vệ & an ninh
      "canteen_fnb", // Căng tin, party, F&B services
      "commercial_area", // Khu dịch vụ thương mại
      "indoor_parking" // Khu đỗ xe trong nhà
];

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

const AnnualEnergySchema = new mongoose.Schema(
      {
            year: { type: Number, required: true },
            monthlyAverageEnergyConsumption: { type: Number, required: true, min: 0 }
      },
      { _id: false }
);

const BuildingUserSchema = new mongoose.Schema(
      {
            fullName: { type: String, required: true, trim: true, maxlength: 120 },
            email: {
                  type: String,
                  required: true,
                  trim: true,
                  lowercase: true,
                  maxlength: 254,
                  match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"]
            },
            phone: {
                  type: String,
                  required: true,
                  trim: true,
                  maxlength: 30
            }
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

            controlSystemType: {
                  type: String,
                  enum: CONTROL_SYSTEM_TYPES,
                  default: "Other"
            },

            climateZone: { type: String },

            outdoorParkingArea: { type: Number, default: 0, min: 0 },
            indoorParkingArea: { type: Number, default: 0, min: 0 },
            parkingAnnualElectricity: { type: [AnnualEnergySchema], default: [] },

            dataCenterArea: { type: Number, default: 0, min: 0 },
            dataCenterAnnualElectricity: { type: [AnnualEnergySchema], default: [] },
            totalFloor: { type: Number },
            totalStoery: { type: Number },
            totalBasement: { type: Number },

            totalFloorArea: { type: Number, required: true },
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
            zoneCode: { type: String, required: true },

            isRented: { type: Boolean, default: false },

            rentableArea: { type: Number, min: 0, default: null },

            weekday: { type: TimeRangeSchema, default: () => ({ from: null, to: null }) },
            saturday: { type: TimeRangeSchema, default: () => ({ from: null, to: null }) },
            sunday: { type: TimeRangeSchema, default: () => ({ from: null, to: null }) },

            utilisationLevel: { type: String },
            averagePeople: { type: Number, min: 0 },
            note: { type: String }
      },
      { _id: false }
);

SpaceZoneOperationSchema.path("rentableArea").validate({
      validator: function (value) {
            if (this.isRented !== true) return true;
            return Number.isFinite(value) && value > 0;
      },
      message: "rentableArea là bắt buộc và phải > 0 khi isRented = true"
});

const BuildingOperationSchema = new mongoose.Schema(
      {
            governmentZones: {
                  type: [SpaceZoneOperationSchema],
                  default: []
            },
            commercialZones: {
                  type: [SpaceZoneOperationSchema],
                  default: []
            }
      },
      { _id: false }
);

BuildingOperationSchema.path("governmentZones").validate({
      validator: function (zones) {
            return (zones || []).every((z) => GOV_ZONE_CODES.includes(z.zoneCode));
      },
      message: "governmentZones.zoneCode không hợp lệ"
});

BuildingOperationSchema.path("commercialZones").validate({
      validator: function (zones) {
            return (zones || []).every((z) => COM_ZONE_CODES.includes(z.zoneCode));
      },
      message: "commercialZones.zoneCode không hợp lệ"
});

function validateFullYearMonthlyEntries(entries) {
      if (!entries || entries.length === 0) {
            return true;
      }

      const years = entries.map((e) => e.year);
      const uniqueYears = new Set(years);
      if (uniqueYears.size !== years.length) {
            return false;
      }

      for (const entry of entries) {
            const monthlyData = entry.monthlyData;

            if (!monthlyData || monthlyData.length !== 12) {
                  return false;
            }

            const monthSet = new Set(monthlyData.map((m) => m.month));
            if (monthSet.size !== 12) {
                  return false;
            }

            for (let m = 1; m <= 12; m++) {
                  if (!monthSet.has(m)) {
                        return false;
                  }
            }
      }

      return true;
}

const MonthlyConsumptionSchema = new mongoose.Schema(
      {
            month: { type: Number, required: true, min: 1, max: 12 },
            energyConsumption: { type: Number, required: true, min: 0 }
      },
      { _id: false }
);

const ElectricityConsumptionSchema = new mongoose.Schema(
      {
            year: { type: Number, required: true },
            dataSource: {
                  type: Number,
                  required: true,
                  enum: [1, 2]
            },
            monthlyData: { type: [MonthlyConsumptionSchema] }
      },
      { _id: false }
);

const requiredIfSelected = function () {
      return this.isSelected === true;
};

const SolarEnergySchema = new mongoose.Schema(
      {
            isSelected: { type: Boolean, default: false },

            installedArea: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            installedCapacity: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            averageEfficiency: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            averageSunHoursPerYear: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            systemLosses: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            }
      },
      { _id: false }
);

const WindEnergySchema = new mongoose.Schema(
      {
            isSelected: { type: Boolean, default: false },

            turbineCount: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            turbineCapacity: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            averageWindSpeed: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },
            operatingHoursPerYear: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            capacityFactor: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            }
      },
      { _id: false }
);

const GeothermalEnergySchema = new mongoose.Schema(
      {
            isSelected: { type: Boolean, default: false },

            installedCapacity: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            sourceTemperature: {
                  type: Number,
                  required: requiredIfSelected
            },

            operatingHoursPerYear: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            },

            systemCOP: {
                  type: Number,
                  min: 0,
                  required: requiredIfSelected
            }
      },
      { _id: false }
);

const RenewableProductionSchema = new mongoose.Schema(
      {
            year: { type: Number, required: true },

            solar: { type: SolarEnergySchema, default: () => ({ isSelected: false }) },
            wind: { type: WindEnergySchema, default: () => ({ isSelected: false }) },
            geothermal: { type: GeothermalEnergySchema, default: () => ({ isSelected: false }) }
      },
      { _id: false }
);

const BuildingSchema = new mongoose.Schema({
      buildingId: { type: String, required: true, unique: true },

      user: { type: BuildingUserSchema, required: true },

      generalInfo: { type: BuildingGeneralSchema, required: true },
      operation: BuildingOperationSchema,
      consumedElectricity: {
            type: [ElectricityConsumptionSchema],
            validate: {
                  validator: function (entries) {
                        return validateFullYearMonthlyEntries(entries);
                  },
                  message: "Mỗi năm trong năng lượng tiêu thụ phải bao gồm đầy đủ 12 tháng (1–12) và không được trùng tháng."
            }
      },

      producedElectricity: [RenewableProductionSchema],

      createdAt: { type: Date, default: Date.now }
});

BuildingSchema.pre("validate", function () {
      const buildingType = this.generalInfo?.buildingType;

      if (buildingType === 2) {
            const GLA = Number(this.generalInfo?.totalRentableArea || 0);
            const zones = this.operation?.commercialZones || [];

            const sumGLAi = zones
                  .filter((z) => z.isRented === true)
                  .reduce((sum, z) => sum + Number(z.rentableArea || 0), 0);

            if (GLA > 0 && sumGLAi > GLA) {
                  throw new Error(
                        `Tổng rentableArea (GLAᵢ) của các zone đang cho thuê (${sumGLAi}) vượt quá GLA totalRentableArea (${GLA}).`
                  );
            }
      }

      const indoorParking = Number(this.generalInfo?.indoorParkingArea || 0);
      const outdoorParking = Number(this.generalInfo?.outdoorParkingArea || 0);
      const totalParkingArea = indoorParking + outdoorParking;

      const dataCenterArea = Number(this.generalInfo?.dataCenterArea || 0);

      const parkingArr = this.generalInfo?.parkingAnnualElectricity || [];
      const dataCenterArr = this.generalInfo?.dataCenterAnnualElectricity || [];

      if (totalParkingArea > 0 && parkingArr.length === 0) {
            this.invalidate(
                  "generalInfo.parkingAnnualElectricity",
                  "Có bãi đỗ xe (CPA > 0) nên bắt buộc nhập CPEC (parkingAnnualElectricity) theo năm."
            );
      }

      if (dataCenterArea > 0 && dataCenterArr.length === 0) {
            this.invalidate(
                  "generalInfo.dataCenterAnnualElectricity",
                  "Có trung tâm dữ liệu (DCA > 0) nên bắt buộc nhập DCEC (dataCenterAnnualElectricity) theo năm."
            );
      }
});

const Building = mongoose.model("Building", BuildingSchema);

module.exports = Building;
