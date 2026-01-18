const buildingExportService = require("../services/buildingExport.service");

function safeFilename(name) {
      return String(name || "buildings")
            .replace(/[^\w\-]+/g, "_")
            .slice(0, 80);
}

function normaliseBuildingIds(req) {
      const normalised = req.query.buildingIdsNormalized;
      if (Array.isArray(normalised) && normalised.length > 0) {
            return normalised.map((x) => String(x).trim()).filter(Boolean);
      }

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

      if (Array.isArray(buildingIds) && buildingIds.length > 0) return buildingIds;

      const { buildingId } = req.query;
      if (buildingId) return [String(buildingId).trim()].filter(Boolean);

      return null;
}

exports.exportBuildingsExcel = async (req, res, next) => {
      try {
            const buildingIds = normaliseBuildingIds(req);

            const { workbook, filename } = await buildingExportService.buildBuildingsWorkbook({
                  buildingIds
            });

            res.setHeader(
                  "Content-Type",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename(filename)}.xlsx"`
            );

            await workbook.xlsx.write(res);
            res.end();
      } catch (err) {
            next(err);
      }
};

exports.downloadBuildingExcelTemplate = async (req, res, next) => {
      try {
            const { workbook, filename } =
                  await buildingExportService.buildBuildingsTemplateWorkbook();

            res.setHeader(
                  "Content-Type",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                  "Content-Disposition",
                  `attachment; filename="${safeFilename(filename)}.xlsx"`
            );

            await workbook.xlsx.write(res);
            res.end();
      } catch (err) {
            next(err);
      }
};
