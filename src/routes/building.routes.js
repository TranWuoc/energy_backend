const express = require("express");
const router = express.Router();

const buildingController = require("../controllers/building.controller");
const validateRequest = require("../middleware/validateRequest");
const {
      createBuildingSchema,
      updateBuildingSchema
} = require("../validations/building.validation");

// Tạo tòa nhà mới
router.post("/", validateRequest(createBuildingSchema), buildingController.createBuilding);

// Lấy danh sách
router.get("/", buildingController.getAllBuildings);

// Lấy chi tiết theo id
router.get("/buildingId", buildingController.getBuildingById);

// Cập nhật
router.put("/buildingId", validateRequest(updateBuildingSchema), buildingController.updateBuilding);

// Xoá
router.delete("/buildingId", buildingController.deleteBuilding);

module.exports = router;
