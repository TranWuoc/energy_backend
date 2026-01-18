const express = require("express");
const router = express.Router();
const controller = require("../controllers/buildingExport.controller");

router.get("/", (req, res, next) => {
      try {
            const { buildingId } = req.query;

            let buildingIds = req.query.buildingIds ?? req.query["buildingIds[]"] ?? null;

            if (typeof buildingIds === "string") {
                  buildingIds = buildingIds
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
            }

            if (Array.isArray(buildingIds)) {
                  buildingIds = buildingIds.map((s) => String(s).trim()).filter(Boolean);
            }
            if ((!buildingIds || buildingIds.length === 0) && buildingId) {
                  buildingIds = [String(buildingId).trim()];
            }
            req.query.buildingIdsNormalized =
                  buildingIds && buildingIds.length > 0 ? buildingIds : null;

            return controller.exportBuildingsExcel(req, res, next);
      } catch (err) {
            return next(err);
      }
});

router.get("/template", controller.downloadBuildingExcelTemplate);

module.exports = router;
