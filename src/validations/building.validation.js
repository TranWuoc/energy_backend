const Joi = require("joi");

const timeRangeSchema = Joi.object({
      from: Joi.string().allow(null, "").optional(),
      to: Joi.string().allow(null, "").optional()
});

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
            .valid("admin", "meeting", "lobby", "corridor_wc", "security", "other")
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

const consumptionItemSchema = Joi.object({
      year: Joi.number().integer().required(),
      month: Joi.number().integer().min(1).max(12).required(),
      energyConsumption: Joi.number().min(0).required(),
      dataSource: Joi.number().valid(1, 2).required()
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
      consumedElectricity: Joi.array().items(consumptionItemSchema).optional(),
      producedElectricity: Joi.array().items(renewableItemSchema).optional()
});

const updateBuildingSchema = Joi.object({
      generalInfo: generalInfoSchema.optional(),
      operation: operationSchema.optional(),
      consumedElectricity: Joi.array().items(consumptionItemSchema).optional(),
      producedElectricity: Joi.array().items(renewableItemSchema).optional()
});

module.exports = {
      createBuildingSchema,
      updateBuildingSchema
};
