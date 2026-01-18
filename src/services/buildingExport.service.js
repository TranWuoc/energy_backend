const ExcelJS = require("exceljs");
const Building = require("../models/building.model");

const GOV_ZONE_CODES = [
      "admin_work",
      "hall_meeting",
      "lobby_reception",
      "corridor_wc",
      "security",
      "indoor_parking"
];

const COM_ZONE_CODES = [
      "rental_office",
      "hall_meeting",
      "lobby_reception",
      "corridor_wc",
      "security",
      "canteen_fnb",
      "commercial_area",
      "indoor_parking"
];

const BUILDING_TYPE_LABEL = {
      1: "Văn phòng công sở nhà nước",
      2: "Văn phòng thương mại"
};

const ZONE_GROUP_LABEL = {
      governmentZones: "Khu vực thuộc văn phòng công sở nhà nước",
      commercialZones: "Khu vực thuộc văn phòng thương mại"
};

const ZONE_CODE_LABEL = {
      // Gov
      admin_work: "Khu làm việc hành chính",
      hall_meeting: "Hội trường & phòng họp lớn",
      lobby_reception: "Sảnh chính & lễ tân",
      corridor_wc: "Hành lang, cầu thang bộ, khu vệ sinh",
      security: "Khu bảo vệ / an ninh",
      indoor_parking: "Khu đỗ xe trong nhà",

      // Commercial (có overlap keys phía trên, dùng chung nhãn)
      rental_office: "Văn phòng cho thuê",
      canteen_fnb: "Căng tin / F&B / party",
      commercial_area: "Khu dịch vụ thương mại"
};

const DATA_SOURCE_LABEL = {
      1: "Hoá đơn điện hàng tháng",
      2: "Công tơ điện & Báo cáo kiểm toán"
};
const RENEWABLE_TYPE_LABEL = {
      solar: "Năng lượng nhiệt",
      wind: "Năng lượng gió",
      geothermal: "Năng lượng địa nhiệt"
};

function renewableTypeLabel(v) {
      return RENEWABLE_TYPE_LABEL[v] || v || "";
}

function toYesNo(v) {
      if (v === true) return "Có";
      if (v === false) return "Không";
      return "";
}

function buildingTypeLabel(v) {
      return BUILDING_TYPE_LABEL[v] || "";
}

function zoneGroupLabel(v) {
      return ZONE_GROUP_LABEL[v] || v || "";
}

function zoneCodeLabel(v) {
      return ZONE_CODE_LABEL[v] || v || "";
}

function dataSourceLabel(v) {
      return DATA_SOURCE_LABEL[v] || "";
}

function addHeaderStyle(row) {
      row.font = { bold: true };
      row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
}

function autoWidth(worksheet, maxWidth = 45) {
      worksheet.columns.forEach((col) => {
            let max = 10;
            col.eachCell({ includeEmpty: true }, (cell) => {
                  const v = cell.value;
                  const len = v == null ? 0 : String(v).length;
                  if (len > max) max = len;
            });
            col.width = Math.min(max + 2, maxWidth);
      });
}

function toBool(v) {
      if (v === true) return "TRUE";
      if (v === false) return "FALSE";
      return "";
}

function flattenBuildingRow(b) {
      const g = b.generalInfo || {};
      const u = b.user || {};
      return {
            buildingId: b.buildingId,
            createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : "",

            userFullName: u.fullName || "",
            userEmail: u.email || "",
            userPhone: u.phone || "",

            name: g.name || "",
            address: g.address || "",
            owner: g.owner || "",
            buildingType: buildingTypeLabel(g.buildingType),

            commissioningYear: g.commissioningYear ?? "",

            hasHVAC: toYesNo(g.hasHVAC),
            hasLighting: toYesNo(g.hasLighting),
            hasWaterHeating: toYesNo(g.hasWaterHeating),
            otherSystems: g.otherSystems || "",

            setpointTemperature: g.setpointTemperature ?? "",
            setpointHumidity: g.setpointHumidity ?? "",
            setpointLightingLevel: g.setpointLightingLevel ?? "",

            controlSystemType: g.controlSystemType || "",
            climateZone: g.climateZone || "",

            outdoorParkingArea: g.outdoorParkingArea ?? "",
            indoorParkingArea: g.indoorParkingArea ?? "",
            dataCenterArea: g.dataCenterArea ?? "",

            totalFloorArea: g.totalFloorArea ?? "",
            aboveGroundFloorArea: g.aboveGroundFloorArea ?? "",
            basementFloorArea: g.basementFloorArea ?? "",
            totalFloor: g.totalFloor ?? "",
            totalStoery: g.totalStoery ?? "",
            totalBasement: g.totalBasement ?? "",

            nonRentableArea: g.nonRentableArea ?? "",
            totalRentableArea: g.totalRentableArea ?? "",
            vacantArea: g.vacantArea ?? ""
      };
}

function extractOperationRows(b) {
      const rows = [];

      const op = b.operation || {};
      const govZones = op.governmentZones || [];
      const comZones = op.commercialZones || [];

      for (const z of govZones) {
            rows.push({
                  buildingId: b.buildingId,
                  zoneGroup: zoneGroupLabel("governmentZones"),
                  zoneCode: zoneCodeLabel(z.zoneCode) || "",
                  isRented: toYesNo(z.isRented),
                  rentableArea: z.rentableArea ?? "",
                  weekdayFrom: z.weekday?.from ?? "",
                  weekdayTo: z.weekday?.to ?? "",
                  saturdayFrom: z.saturday?.from ?? "",
                  saturdayTo: z.saturday?.to ?? "",
                  sundayFrom: z.sunday?.from ?? "",
                  sundayTo: z.sunday?.to ?? "",
                  utilisationLevel: z.utilisationLevel || "",
                  averagePeople: z.averagePeople ?? "",
                  note: z.note || ""
            });
      }

      for (const z of comZones) {
            rows.push({
                  buildingId: b.buildingId,
                  zoneGroup: zoneGroupLabel("commercialZones"),
                  zoneCode: zoneCodeLabel(z.zoneCode) || "",
                  isRented: toYesNo(z.isRented),
                  rentableArea: z.rentableArea ?? "",
                  weekdayFrom: z.weekday?.from ?? "",
                  weekdayTo: z.weekday?.to ?? "",
                  saturdayFrom: z.saturday?.from ?? "",
                  saturdayTo: z.saturday?.to ?? "",
                  sundayFrom: z.sunday?.from ?? "",
                  sundayTo: z.sunday?.to ?? "",
                  utilisationLevel: z.utilisationLevel || "",
                  averagePeople: z.averagePeople ?? "",
                  note: z.note || ""
            });
      }

      return rows;
}

function extractConsumedRows(b) {
      const rows = [];
      const consumed = b.consumedElectricity || [];

      for (const entry of consumed) {
            const year = entry.year;
            const dataSource = entry.dataSource;

            const monthlyData = entry.monthlyData || [];
            for (const m of monthlyData) {
                  rows.push({
                        buildingId: b.buildingId,
                        year: year ?? "",
                        month: m.month ?? "",
                        energyConsumption: m.energyConsumption ?? "",
                        dataSource: dataSourceLabel(dataSource) ?? ""
                  });
            }
      }

      return rows;
}

function extractProducedRows(b) {
      const rows = [];
      const produced = b.producedElectricity || [];

      for (const entry of produced) {
            const year = entry.year;

            // solar
            rows.push({
                  buildingId: b.buildingId,
                  year,
                  type: renewableTypeLabel("solar"),
                  isSelected: toYesNo(entry.solar?.isSelected),
                  installedArea: entry.solar?.installedArea ?? "",
                  installedCapacity: entry.solar?.installedCapacity ?? "",
                  averageEfficiency: entry.solar?.averageEfficiency ?? "",
                  averageSunHoursPerYear: entry.solar?.averageSunHoursPerYear ?? "",
                  systemLosses: entry.solar?.systemLosses ?? "",
                  turbineCount: "",
                  turbineCapacity: "",
                  averageWindSpeed: "",
                  operatingHoursPerYear: "",
                  capacityFactor: "",
                  sourceTemperature: "",
                  systemCOP: ""
            });

            // wind
            rows.push({
                  buildingId: b.buildingId,
                  year,
                  type: renewableTypeLabel("wind"),
                  isSelected: toYesNo(entry.wind?.isSelected),
                  installedArea: "",
                  installedCapacity: "",
                  averageEfficiency: "",
                  averageSunHoursPerYear: "",
                  systemLosses: "",
                  turbineCount: entry.wind?.turbineCount ?? "",
                  turbineCapacity: entry.wind?.turbineCapacity ?? "",
                  averageWindSpeed: entry.wind?.averageWindSpeed ?? "",
                  operatingHoursPerYear: entry.wind?.operatingHoursPerYear ?? "",
                  capacityFactor: entry.wind?.capacityFactor ?? "",
                  sourceTemperature: "",
                  systemCOP: ""
            });

            // geothermal
            rows.push({
                  buildingId: b.buildingId,
                  year,
                  type: renewableTypeLabel("geothermal"),
                  isSelected: toYesNo(entry.geothermal?.isSelected),
                  installedArea: "",
                  installedCapacity: entry.geothermal?.installedCapacity ?? "",
                  averageEfficiency: "",
                  averageSunHoursPerYear: "",
                  systemLosses: "",
                  turbineCount: "",
                  turbineCapacity: "",
                  averageWindSpeed: "",
                  operatingHoursPerYear: entry.geothermal?.operatingHoursPerYear ?? "",
                  capacityFactor: "",
                  sourceTemperature: entry.geothermal?.sourceTemperature ?? "",
                  systemCOP: entry.geothermal?.systemCOP ?? ""
            });
      }

      return rows;
}

function sheetBuildings(workbook, buildings) {
      const ws = workbook.addWorksheet("Thông tin chung");

      ws.columns = [
            { header: "Mã toà nhà", key: "buildingId" },
            { header: "Thời gian khảo sát", key: "createdAt" },

            { header: "Người tạo khảo sát", key: "userFullName" },
            { header: "Email", key: "userEmail" },
            { header: "Số điện thoại", key: "userPhone" },

            { header: "Tên văn phòng", key: "name" },
            { header: "Địa chỉ văn phòng", key: "address" },
            { header: "Chủ sở hữu", key: "owner" },
            { header: "Kiểu toà nhà", key: "buildingType" },
            { header: "Năm vận hành", key: "commissioningYear" },

            { header: "Hệ thống HVAC", key: "hasHVAC" },
            { header: "Hệ thống chiếu sáng", key: "hasLighting" },
            { header: "Hệ thống nước nóng", key: "hasWaterHeating" },
            { header: "Hệ thống khác", key: "otherSystems" },

            { header: "Thông số cài đặt nhiệt độ", key: "setpointTemperature" },
            { header: "Thông số cài đặt độ ẩm", key: "setpointHumidity" },
            { header: "Thông số cài đặt độ sáng", key: "setpointLightingLevel" },

            { header: "Loại kiểm soát hệ thống", key: "controlSystemType" },
            { header: "Khu vực", key: "climateZone" },

            { header: "Tổng số tầng văn phòng", key: "totalFloor" },
            { header: "Tổng số tầng trên mặt đất", key: "totalStoery" },
            { header: "Tổng số tầng hầm", key: "totalBasement" },

            { header: "Diện tích bãi đỗ xe ngoài trời (m²)", key: "outdoorParkingArea" },
            { header: "Diện tích bãi đỗ xe trong nhà (m²)", key: "indoorParkingArea" },
            { header: "Diện tích trung tâm dữ liệu (m²)", key: "dataCenterArea" },

            { header: "Tổng diện tích sàn xây dựng (m²)", key: "totalFloorArea" },
            { header: "Tổng diện tích sàn mặt đất (m²)", key: "aboveGroundFloorArea" },
            { header: "Tổng diện tích sàn tầng hầm (m²)", key: "basementFloorArea" },

            { header: "Diện tích phần không cho thuê (m²)", key: "nonRentableArea" },
            { header: "Tổng diện tích cho thuê (m²)", key: "totalRentableArea" },
            { header: "Diện tích trống (m²)", key: "vacantArea" }
      ];

      addHeaderStyle(ws.getRow(1));
      ws.getRow(1).height = 24;

      buildings.forEach((b) => ws.addRow(flattenBuildingRow(b)));

      ws.views = [{ state: "frozen", ySplit: 1 }];
      autoWidth(ws);
}

function sheetOperation(workbook, buildings) {
      const ws = workbook.addWorksheet("Giờ vận hành hệ thống");

      ws.columns = [
            { header: "Mã toà nhà", key: "buildingId" },
            { header: "Nhóm khu vực", key: "zoneGroup" },
            { header: "Khu vực (Zone)", key: "zoneCode" },
            { header: "Có cho thuê", key: "isRented" },
            { header: "Diện tích cho thuê (m²)", key: "rentableArea" },
            { header: "T2–T6: Từ", key: "weekdayFrom" },
            { header: "T2–T6: Đến", key: "weekdayTo" },
            { header: "T7: Từ", key: "saturdayFrom" },
            { header: "T7: Đến", key: "saturdayTo" },
            { header: "CN: Từ", key: "sundayFrom" },
            { header: "CN: Đến", key: "sundayTo" },
            { header: "Mức độ sử dụng", key: "utilisationLevel" },
            { header: "Số người TB", key: "averagePeople" },
            { header: "Ghi chú", key: "note" }
      ];

      addHeaderStyle(ws.getRow(1));
      ws.views = [{ state: "frozen", ySplit: 1 }];

      for (const b of buildings) {
            const rows = extractOperationRows(b);
            rows.forEach((r) => ws.addRow(r));
      }

      autoWidth(ws);
}

function sheetConsumed(workbook, buildings) {
      const ws = workbook.addWorksheet("Điện năng tiêu thụ");

      ws.columns = [
            { header: "Mã toà nhà", key: "buildingId" },
            { header: "Năm", key: "year" },
            { header: "Tháng", key: "month" },
            { header: "Điện năng tiêu thụ (kWh)", key: "energyConsumption" },
            { header: "Nguồn dữ liệu", key: "dataSource" }
      ];

      addHeaderStyle(ws.getRow(1));
      ws.views = [{ state: "frozen", ySplit: 1 }];

      for (const b of buildings) {
            const rows = extractConsumedRows(b);
            rows.forEach((r) => ws.addRow(r));
      }

      autoWidth(ws);
}

function sheetProduced(workbook, buildings) {
      const ws = workbook.addWorksheet("Năng lượng tái tạo sản xuất");

      ws.columns = [
            { header: "Mã toà nhà", key: "buildingId" },
            { header: "Năm", key: "year" },
            { header: "Kiểu năng lượng (Mặt trời/Gió/Địa nhiệt)", key: "type" },
            { header: "Có sử dụng", key: "isSelected" },

            // solar fields
            { header: "Diện tích lắp đặt (m²)", key: "installedArea" },
            { header: "Công suất lắp đặt (kWp)", key: "installedCapacity" },
            { header: "Hiệu suất trung bình (%)", key: "averageEfficiency" },
            { header: "Giờ nắng TB/năm", key: "averageSunHoursPerYear" },
            { header: "Tổn thất hệ thống (%)", key: "systemLosses" },

            // wind fields
            { header: "Số turbine (cái)", key: "turbineCount" },
            { header: "Công suất/turbine (kWp)", key: "turbineCapacity" },
            { header: "Tốc độ gió TB (m/s)", key: "averageWindSpeed" },
            { header: "Giờ vận hành/năm", key: "operatingHoursPerYear" },
            { header: "Hệ số công suất (%)", key: "capacityFactor" },

            // geothermal fields
            { header: "Công suất lắp đặt (kWp)", key: "installedCapacity" },
            { header: "Nhiệt độ nguồn (°C)", key: "sourceTemperature" },
            { header: "Giờ vận hành/năm", key: "operatingHoursPerYear" },
            { header: "COP hệ thống", key: "systemCOP" }
      ];

      addHeaderStyle(ws.getRow(1));
      ws.views = [{ state: "frozen", ySplit: 1 }];

      for (const b of buildings) {
            const rows = extractProducedRows(b);
            rows.forEach((r) => ws.addRow(r));
      }

      autoWidth(ws);
}

function sheetTemplate(workbook) {
      // Template gồm:
      // - README (hướng dẫn)
      // - Buildings_Template (headers + dropdown)
      // - Operation_Zones_Template
      // - Consumed_Electricity_Template
      // - Produced_Electricity_Template
      // - Data_Dictionary (list values cho dropdown)

      const readme = workbook.addWorksheet("README");
      readme.addRow(["How to use this template"]);
      readme.addRow([
            "1) Fill data in *_Template sheets. Do not rename columns. Keep buildingId consistent across sheets."
      ]);
      readme.addRow(["2) Boolean fields use TRUE/FALSE. Time fields use HH:mm (e.g. 08:00)."]);
      readme.addRow(["3) For Consumed_Electricity, each year should have 12 rows (month 1..12)."]);
      readme.addRow(["4) Zone codes must follow the allowed list in Data_Dictionary sheet."]);
      readme.getRow(1).font = { bold: true };

      // Data dictionary
      const dict = workbook.addWorksheet("Data_Dictionary");
      dict.addRow(["buildingType_allowed", "1", "2"]);
      dict.addRow(["consumed.dataSource_allowed", "1", "2"]);
      dict.addRow(["bool_allowed", "TRUE", "FALSE"]);
      dict.addRow(["gov_zoneCode_allowed", ...GOV_ZONE_CODES]);
      dict.addRow(["com_zoneCode_allowed", ...COM_ZONE_CODES]);
      dict.getRow(1).font = { bold: true };
      autoWidth(dict);

      // Buildings template
      const bws = workbook.addWorksheet("Buildings_Template");
      bws.columns = [
            { header: "buildingId*", key: "buildingId" },
            { header: "user.fullName*", key: "userFullName" },
            { header: "user.email*", key: "userEmail" },
            { header: "user.phone*", key: "userPhone" },
            { header: "generalInfo.name*", key: "name" },
            { header: "generalInfo.address*", key: "address" },
            { header: "generalInfo.owner", key: "owner" },
            { header: "generalInfo.buildingType* (1/2)", key: "buildingType" },
            { header: "generalInfo.totalFloorArea*", key: "totalFloorArea" },
            { header: "generalInfo.aboveGroundFloorArea*", key: "aboveGroundFloorArea" },
            { header: "generalInfo.basementFloorArea*", key: "basementFloorArea" },
            { header: "generalInfo.hasHVAC (TRUE/FALSE)", key: "hasHVAC" },
            { header: "generalInfo.hasLighting (TRUE/FALSE)", key: "hasLighting" },
            { header: "generalInfo.hasWaterHeating (TRUE/FALSE)", key: "hasWaterHeating" }
      ];
      addHeaderStyle(bws.getRow(1));
      bws.views = [{ state: "frozen", ySplit: 1 }];
      autoWidth(bws);

      // Operation zones template
      const ows = workbook.addWorksheet("Operation_Zones_Template");
      ows.columns = [
            { header: "buildingId*", key: "buildingId" },
            { header: "zoneGroup* (governmentZones/commercialZones)", key: "zoneGroup" },
            { header: "zoneCode*", key: "zoneCode" },
            { header: "isRented (TRUE/FALSE)", key: "isRented" },
            { header: "rentableArea (required if isRented=TRUE)", key: "rentableArea" },
            { header: "weekday.from (HH:mm)", key: "weekdayFrom" },
            { header: "weekday.to (HH:mm)", key: "weekdayTo" },
            { header: "saturday.from (HH:mm)", key: "saturdayFrom" },
            { header: "saturday.to (HH:mm)", key: "saturdayTo" },
            { header: "sunday.from (HH:mm)", key: "sundayFrom" },
            { header: "sunday.to (HH:mm)", key: "sundayTo" }
      ];
      addHeaderStyle(ows.getRow(1));
      ows.views = [{ state: "frozen", ySplit: 1 }];
      autoWidth(ows);

      // Consumed template
      const cws = workbook.addWorksheet("Consumed_Electricity_Template");
      cws.columns = [
            { header: "buildingId*", key: "buildingId" },
            { header: "year*", key: "year" },
            { header: "month* (1..12)", key: "month" },
            { header: "energyConsumption (kWh)*", key: "energyConsumption" },
            { header: "dataSource* (1/2)", key: "dataSource" }
      ];
      addHeaderStyle(cws.getRow(1));
      cws.views = [{ state: "frozen", ySplit: 1 }];
      autoWidth(cws);

      // Produced template
      const pws = workbook.addWorksheet("Produced_Electricity_Template");
      pws.columns = [
            { header: "buildingId*", key: "buildingId" },
            { header: "year*", key: "year" },
            { header: "type* (solar/wind/geothermal)", key: "type" },
            { header: "isSelected (TRUE/FALSE)", key: "isSelected" },

            { header: "installedArea (solar)", key: "installedArea" },
            { header: "installedCapacity (solar/wind/geothermal)", key: "installedCapacity" },
            { header: "averageEfficiency (solar)", key: "averageEfficiency" },
            { header: "averageSunHoursPerYear (solar)", key: "averageSunHoursPerYear" },
            { header: "systemLosses (solar)", key: "systemLosses" },

            { header: "turbineCount (wind)", key: "turbineCount" },
            { header: "turbineCapacity (wind)", key: "turbineCapacity" },
            { header: "averageWindSpeed (wind)", key: "averageWindSpeed" },
            { header: "operatingHoursPerYear (wind/geothermal)", key: "operatingHoursPerYear" },
            { header: "capacityFactor (wind)", key: "capacityFactor" },

            { header: "sourceTemperature (geothermal)", key: "sourceTemperature" },
            { header: "systemCOP (geothermal)", key: "systemCOP" }
      ];
      addHeaderStyle(pws.getRow(1));
      pws.views = [{ state: "frozen", ySplit: 1 }];
      autoWidth(pws);
}

exports.buildBuildingsWorkbook = async ({ buildingIds, buildingId }) => {
      // Support both:
      // - buildingIds: array of buildingId strings
      // - buildingId: single string (backward compatible)
      // - null/undefined => export all

      let ids = null;

      if (Array.isArray(buildingIds) && buildingIds.length > 0) {
            ids = buildingIds.map((x) => String(x).trim()).filter(Boolean);
      } else if (buildingId) {
            ids = [String(buildingId).trim()].filter(Boolean);
      }

      const filter = ids && ids.length > 0 ? { buildingId: { $in: ids } } : {};

      const buildings = await Building.find(filter).lean();

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "energy-backend";
      workbook.created = new Date();

      sheetBuildings(workbook, buildings);
      sheetOperation(workbook, buildings);
      sheetConsumed(workbook, buildings);
      sheetProduced(workbook, buildings);

      const filename =
            ids && ids.length > 0
                  ? ids.length === 1
                        ? `building_export_${ids[0]}`
                        : `buildings_export_${ids.length}_items_${Date.now()}`
                  : `buildings_export_${Date.now()}`;

      return { workbook, filename };
};

exports.buildBuildingsTemplateWorkbook = async () => {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "energy-backend";
      workbook.created = new Date();

      sheetTemplate(workbook);

      return { workbook, filename: "building_excel_template_admin" };
};
