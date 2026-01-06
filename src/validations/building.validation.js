const Joi = require("joi");

const timeRangeSchema = Joi.object({
      from: Joi.string().allow(null, "").optional(),
      to: Joi.string().allow(null, "").optional()
});

const monthlyConsumptionSchema = Joi.object({
      month: Joi.number().min(1).max(12).required(),
      energyConsumption: Joi.number().min(0).required()
});

const electricityConsumptionSchema = Joi.object({
      year: Joi.number().required(),
      dataSource: Joi.number().valid(1, 2).required(),
      monthlyData: Joi.array()
            .items(monthlyConsumptionSchema)
            .length(12)
            .custom((value, helpers) => {
                  const months = value.map((item) => item.month);
                  const uniqueMonths = new Set(months);

                  if (uniqueMonths.size !== 12) {
                        return helpers.error("any.custom", {
                              message: "Phải có đủ 12 tháng khác nhau (1-12)"
                        });
                  }

                  for (let m = 1; m <= 12; m++) {
                        if (!uniqueMonths.has(m)) {
                              return helpers.error("any.custom", {
                                    message: `Thiếu tháng ${m}`
                              });
                        }
                  }

                  return value;
            })
            .required()
});

const consumedElectricitySchema = Joi.array()
      .items(electricityConsumptionSchema)
      .min(1)
      .custom((value, helpers) => {
            // Kiểm tra không có năm trùng lặp
            const years = value.map((entry) => entry.year);
            const uniqueYears = new Set(years);

            if (uniqueYears.size !== years.length) {
                  return helpers.error("any.custom", {
                        message: "Không được có năm trùng lặp"
                  });
            }

            return value;
      }, "Validate yearly consumption");

const systemZoneSchema = Joi.object({
      zoneCode: Joi.string().required(),
      hvac: timeRangeSchema.optional(),
      lighting: timeRangeSchema.optional(),
      waterHeating: timeRangeSchema.optional(),
      camera: timeRangeSchema.optional()
});

const generalInfoSchema = Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      owner: Joi.string().allow(null, ""),
      buildingType: Joi.number().valid(1, 2).required(),
      commissioningYear: Joi.number().integer().min(1900).max(3000).optional(),

      hasHVAC: Joi.boolean().optional(),
      hasLighting: Joi.boolean().optional(),
      hasDHW: Joi.boolean().optional(),
      otherSystems: Joi.string().allow("", null),

      setpointTemperature: Joi.number().optional(),
      setpointHumidity: Joi.number().optional(),
      setpointIlluminance: Joi.number().optional(),

      controlSystemType: Joi.string().allow("", null),

      totalFloorArea: Joi.number().min(0).optional(),
      aboveGroundFloors: Joi.number().integer().min(0).optional(),
      basementFloors: Joi.number().integer().min(0).optional(),
      indoorParkingArea: Joi.number().min(0).optional(),
      nonRentableArea: Joi.number().min(0).optional(),
      totalRentableArea: Joi.number().min(0).optional(),
      vacantArea: Joi.number().min(0).optional(),

      governmentSystemZones: Joi.array().items(systemZoneSchema).optional(),
      commercialSystemZones: Joi.array().items(systemZoneSchema).optional()
});

const spaceZoneSchema = Joi.object({
      zoneCode: Joi.string()
            .valid("administration", "meeting", "lobby", "corridor_wc", "security", "other")
            .required(),
      weekday: timeRangeSchema.optional(),
      saturday: timeRangeSchema.optional(),
      sunday: timeRangeSchema.optional(),
      utilisationLevel: Joi.string().allow("", null),
      averagePeople: Joi.number().integer().min(0).optional(),
      note: Joi.string().allow("", null)
});

const operationSchema = Joi.object({
      spaceZones: Joi.array().items(spaceZoneSchema).optional()
});

const solarSchema = Joi.object({
      isSelected: Joi.boolean().optional(),
      installedArea: Joi.number().min(0).optional(),
      installedCapacity: Joi.number().min(0).optional(),
      averageEfficiency: Joi.number().min(0).optional(),
      averageSunHoursPerYear: Joi.number().min(0).optional(),
      systemLosses: Joi.number().min(0).optional()
});

const windSchema = Joi.object({
      isSelected: Joi.boolean().optional(),
      turbineCount: Joi.number().min(0).optional(),
      turbineCapacity: Joi.number().min(0).optional(),
      averageWindSpeed: Joi.number().min(0).optional(),
      operatingHoursPerYear: Joi.number().min(0).optional(),
      capacityFactor: Joi.number().min(0).optional()
});

const geothermalSchema = Joi.object({
      isSelected: Joi.boolean().optional(),
      installedCapacity: Joi.number().min(0).optional(),
      sourceTemperature: Joi.number().optional(),
      operatingHoursPerYear: Joi.number().min(0).optional(),
      systemCOP: Joi.number().min(0).optional()
});

const renewableItemSchema = Joi.object({
      year: Joi.number().integer().required(),
      solar: solarSchema.optional(),
      wind: windSchema.optional(),
      geothermal: geothermalSchema.optional()
});

const createBuildingSchema = Joi.object({
      generalInfo: generalInfoSchema.required(),
      operation: operationSchema.optional(),
      consumedElectricity: consumedElectricitySchema.required(),
      producedElectricity: Joi.array().items(renewableItemSchema).optional().required()
});

const updateBuildingSchema = Joi.object({
      generalInfo: generalInfoSchema.optional(),
      operation: operationSchema.optional(),
      consumedElectricity: consumedElectricitySchema.required(),
      producedElectricity: Joi.array().items(renewableItemSchema).optional()
});

module.exports = {
      createBuildingSchema,
      updateBuildingSchema
};
