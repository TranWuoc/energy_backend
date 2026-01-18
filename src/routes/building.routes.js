const express = require("express");
const router = express.Router();

const buildingController = require("../controllers/building.controller");
const validateRequest = require("../middlewares/validateRequest");
const {
      createBuildingSchema,
      updateBuildingSchema
} = require("../validations/building.validation");
const { authenticate, authorize } = require("../middlewares/auth");

router.post("/", validateRequest(createBuildingSchema), buildingController.createBuilding);

router.get("/", buildingController.getAllBuildings);

router.get("/:buildingId", buildingController.getDetailBuilding);

router.put(
      "/:buildingId",
      validateRequest(updateBuildingSchema),
      buildingController.updateBuilding
);

router.delete(
      "/:buildingId",
      authenticate,
      authorize("super_admin"),
      buildingController.deleteBuilding
);
module.exports = router;
