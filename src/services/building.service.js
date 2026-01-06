// src/services/building.service.js
const buildingRepo = require("../repositories/building.repository");
const { generateBuildingId } = require("../utils/buildingId");
const mongoose = require("mongoose");
const epCalculator = require("../calculators/ep.calculator");

// Version tag for business rules used in EP (helps auditing when rules change)
const EP_RULE_VERSION = "EP_v1_vacantArea_over_GLA";

async function createBuilding(payload) {
      try {
            const buildingId = await generateBuildingId();

            const building = await buildingRepo.createBuilding({
                  ...payload,
                  buildingId
            });

            // 2) Compute EP (derived data). Do NOT block building creation if EP cannot be computed yet.
            //    EP depends on: consumedElectricity (12 months/year), areas (GFA/GLA), vacantArea, etc.
            let energyPerformance = [];
            let epSaved = false;

            try {
                  // If the building has enough data, compute EP for all available years.
                  energyPerformance = epCalculator.computeEnergyPerformanceAllYears(building);

                  // 3) Persist EP results into a separate collection.
                  //    Using native collection to avoid adding new model files at this stage.
                  const col = mongoose.connection.collection("energy_performances");
                  const now = new Date();
                  const buildingName = building.generalInfo?.name || null;
                  const buildingType = building.generalInfo?.buildingType || null;
                  const climateZone = building.generalInfo?.climateZone || null;

                  const docs = energyPerformance.map((r) => ({
                        buildingId: r.buildingId,
                        buildingName,
                        buildingType,
                        climateZone,
                        year: r.year,
                        ep: r.EP,
                        inputs: r.inputs,
                        normalised: r.normalised,
                        ruleVersion: EP_RULE_VERSION,
                        computedAt: now
                  }));

                  if (docs.length > 0) {
                        const ops = docs.map((d) => ({
                              updateOne: {
                                    filter: {
                                          buildingId: d.buildingId,
                                          year: d.year,
                                          ruleVersion: d.ruleVersion
                                    },
                                    update: { $set: d },
                                    upsert: true
                              }
                        }));

                        await col.bulkWrite(ops, { ordered: false });
                        epSaved = true;
                  }
            } catch (epErr) {
                  energyPerformance = [];
                  epSaved = false;
            }

            // 4) Return building + EP results
            return {
                  building,
                  energyPerformance,
                  epSaved,
                  epRuleVersion: EP_RULE_VERSION
            };
      } catch (err) {
            // Duplicate key error (Mongo)
            if (err.code === 11000 && err.keyPattern?.buildingId) {
                  throw {
                        statusCode: 400,
                        message: "Mã buildingId đã tồn tại, vui lòng thử lại"
                  };
            }
            throw err;
      }
}

async function listBuildings() {
      return buildingRepo.getAllBuildings();
}

async function getBuildingDetail(buildingId) {
      const building = await buildingRepo.getDetailBuilding(buildingId);
      if (!building) {
            throw {
                  statusCode: 404,
                  message: "Không tìm thấy tòa nhà"
            };
      }

      return building;
}

async function updateBuilding(buildingId, payload) {
      try {
            const updated = await buildingRepo.updateBuilding(buildingId, payload);

            if (!updated) {
                  throw {
                        statusCode: 404,
                        message: "Không tìm thấy tòa nhà"
                  };
            }

            let energyPerformance = [];
            let epSaved = false;

            try {
                  // If the building has enough data, compute EP for all available years.
                  energyPerformance = epCalculator.computeEnergyPerformanceAllYears(building);

                  // 3) Persist EP results into a separate collection.
                  //    Using native collection to avoid adding new model files at this stage.
                  const col = mongoose.connection.collection("energy_performances");
                  const now = new Date();
                  const buildingName = building.generalInfo?.name || null;
                  const buildingType = building.generalInfo?.buildingType || null;
                  const climateZone = building.generalInfo?.climateZone || null;

                  const docs = energyPerformance.map((r) => ({
                        buildingId: r.buildingId,
                        buildingName,
                        buildingType,
                        climateZone,
                        year: r.year,
                        ep: r.EP,
                        inputs: r.inputs,
                        normalised: r.normalised,
                        ruleVersion: EP_RULE_VERSION,
                        computedAt: now
                  }));

                  if (docs.length > 0) {
                        const ops = docs.map((d) => ({
                              updateOne: {
                                    filter: {
                                          buildingId: d.buildingId,
                                          year: d.year,
                                          ruleVersion: d.ruleVersion
                                    },
                                    update: { $set: d },
                                    upsert: true
                              }
                        }));

                        await col.bulkWrite(ops, { ordered: false });
                        epSaved = true;
                  }
            } catch (epErr) {
                  energyPerformance = [];
                  epSaved = false;
            }

            return {
                  building: updated,
                  energyPerformance,
                  epSaved,
                  epRuleVersion: EP_RULE_VERSION
            };
      } catch (err) {
            if (err.name === "ValidationError") {
                  throw err;
            }
            throw err;
      }
}

async function removeBuilding(buildingId) {
      const deleted = await buildingRepo.deleteBuilding(buildingId);
      if (!deleted) {
            throw {
                  statusCode: 404,
                  message: "Không tìm thấy tòa nhà"
            };
      }
      try {
            const col = mongoose.connection.collection("energy_performances");
            await col.deleteMany({ buildingId });
      } catch (e) {
            console.error("Lỗi khi xóa dữ liệu EP liên quan:", e);
      }

      return { message: "Xóa tòa nhà thành công" };
}

module.exports = {
      createBuilding,
      listBuildings,
      getBuildingDetail,
      updateBuilding,
      removeBuilding
};
