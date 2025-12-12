// src/services/building.service.js
const buildingRepo = require("../repositories/building.repository");
const { generateBuildingId } = require("../utils/buildingId");
const mongoose = require("mongoose");

async function createBuilding(payload) {
      try {
            const buildingId = await generateBuildingId();

            const building = await buildingRepo.createBuilding({
                  ...payload,
                  buildingId
            });

            return building;
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

async function getBuildingDetail(id) {
      if (!mongoose.isValidObjectId(id)) {
            throw {
                  statusCode: 400,
                  message: "ID không hợp lệ"
            };
      }

      const building = await buildingRepo.getBuildingById(id);
      if (!building) {
            throw {
                  statusCode: 404,
                  message: "Không tìm thấy tòa nhà"
            };
      }

      return building;
}

async function updateBuilding(id, payload) {
      if (!mongoose.isValidObjectId(id)) {
            throw {
                  statusCode: 400,
                  message: "ID không hợp lệ"
            };
      }

      try {
            const updated = await buildingRepo.updateBuilding(id, payload);

            if (!updated) {
                  throw {
                        statusCode: 404,
                        message: "Không tìm thấy tòa nhà"
                  };
            }

            return updated;
      } catch (err) {
            if (err.name === "ValidationError") {
                  throw err;
            }
            throw err;
      }
}

async function removeBuilding(id) {
      if (!mongoose.isValidObjectId(id)) {
            throw {
                  statusCode: 400,
                  message: "ID không hợp lệ"
            };
      }

      const deleted = await buildingRepo.deleteBuilding(id);
      if (!deleted) {
            throw {
                  statusCode: 404,
                  message: "Không tìm thấy tòa nhà"
            };
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
