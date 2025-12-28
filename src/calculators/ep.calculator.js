// src/calculators/ep.calculator.js
const { EP_VARS, EP_DEFAULTS } = require("../constant/ep.constants");

/**
 * Helpers
 */
function clampNumber(v, fallback = 0) {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
}

function ensureNonNegative(n) {
      return n < 0 ? 0 : n;
}

function listYearsFromMonthly(entries = []) {
      const years = new Set();
      for (const e of entries || []) {
            if (e && typeof e.year === "number") years.add(e.year);
      }
      return Array.from(years).sort((a, b) => a - b);
}

function sumKwhForYear(entries = [], year) {
      if (!Array.isArray(entries)) return 0;

      return entries
            .filter((e) => e && e.year === year)
            .reduce((sum, e) => sum + (Number(e.energyConsumption) || 0), 0);
}

function computeVacantRate(generalInfo) {
      const vacantArea = clampNumber(generalInfo?.vacantArea, 0);
      const totalRentableArea = clampNumber(generalInfo?.totalRentableArea, 0);
      if (totalRentableArea > 0) {
            return Math.max(0, Math.min(1, vacantArea / totalRentableArea));
      }
      return 0;
}

function computeEffectiveFloorArea(generalInfo) {
      // EFA = GFA - CPA - DCA - (GLA * FVR)
      const gfa = clampNumber(generalInfo?.totalFloorArea, 0); // GFA
      const cpa = ensureNonNegative(clampNumber(generalInfo?.outdoorParkingArea, 0)); // CPA
      const dca = ensureNonNegative(clampNumber(generalInfo?.dataCenterArea, 0)); // DCA
      const gla = ensureNonNegative(clampNumber(generalInfo?.totalRentableArea, 0)); // GLA
      const fvr = computeVacantRate(generalInfo); // FVR

      return gfa - cpa - dca - gla * fvr;
}
// Time Factor TF = AWH / WOH (default 1 if missing)
function computeTimeFactor(opts = {}) {
      const awh = clampNumber(opts.AWH, null);
      const woh = clampNumber(opts.WOH, null);
      if (awh === null || woh === null) return EP_DEFAULTS.TF;
      if (woh <= 0) return EP_DEFAULTS.TF;
      return awh / woh;
}

/**
 * Validate EP inputs for a year and return derived values.
 * Returns: { ok, issues, derived }
 */
function validateEpInputsForYear(buildingDoc, year, opts = {}) {
      const issues = [];
      // General Info = gi
      const gi = buildingDoc?.generalInfo || {};

      // Areas
      const gfa = clampNumber(gi.totalFloorArea, NaN);
      const cpa = ensureNonNegative(clampNumber(gi.outdoorParkingArea, 0));
      const dca = ensureNonNegative(clampNumber(gi.dataCenterArea, 0));
      const gla = ensureNonNegative(clampNumber(gi.totalRentableArea, 0));

      // Vacancy
      const fvr = computeVacantRate(gi);

      if (!Number.isFinite(gfa) || gfa <= 0) {
            issues.push({
                  field: "generalInfo.totalFloorArea",
                  message: "GFA (totalFloorArea) phải > 0"
            });
      }
      if (fvr < 0 || fvr > 1) {
            issues.push({
                  field: "generalInfo.vacantRate",
                  message: "FVR (vacantRate) phải nằm trong [0..1]"
            });
      }

      // Electricity
      const tbec = sumKwhForYear(buildingDoc.consumedElectricity || [], year);
      const cpec = sumKwhForYear(buildingDoc.parkingElectricity || [], year);
      const dcec = sumKwhForYear(buildingDoc.dataCenterElectricity || [], year);

      if (!Number.isFinite(tbec) || tbec <= 0) {
            issues.push({ field: "consumedElectricity", message: `TBEC phải > 0 cho năm ${year}` });
      }
      if (cpec + dcec > tbec) {
            issues.push({
                  field: "parkingElectricity/dataCenterElectricity",
                  message: "CPEC + DCEC không được lớn hơn TBEC"
            });
      }

      // Optional hours
      const awh = opts.AWH != null ? Number(opts.AWH) : null;
      const woh = opts.WOH != null ? Number(opts.WOH) : null;
      if (awh != null && (!Number.isFinite(awh) || awh <= 0)) {
            issues.push({ field: "AWH", message: "AWH phải là số > 0" });
      }
      if (woh != null && (!Number.isFinite(woh) || woh <= 0)) {
            issues.push({ field: "WOH", message: "WOH phải là số > 0" });
      }

      // Cross-check EFA
      const efa = computeEffectiveFloorArea(gi);
      if (!Number.isFinite(efa) || efa <= 0) {
            issues.push({
                  field: "EFA",
                  message: "EFA <= 0. Kiểm tra lại GFA/CPA/DCA/GLA và FVR (có thể đang trừ quá nhiều)."
            });
      }

      return {
            ok: issues.length === 0,
            issues,
            derived: {
                  [EP_VARS.GFA]: gfa,
                  [EP_VARS.CPA]: cpa,
                  [EP_VARS.DCA]: dca,
                  [EP_VARS.GLA]: gla,
                  [EP_VARS.FVR]: fvr,
                  [EP_VARS.EFA]: efa,

                  [EP_VARS.TBEC]: tbec,
                  [EP_VARS.CPEC]: cpec,
                  [EP_VARS.DCEC]: dcec,
                  [EP_VARS.EEC]: tbec - cpec - dcec
            }
      };
}

/**
 * Compute EP for a single year.
 * Throws Error(statusCode=400, details=[...]) if invalid.
 */
function computeEnergyPerformanceForYear(buildingDoc, year, opts = {}) {
      const gi = buildingDoc?.generalInfo || {};

      const validation = validateEpInputsForYear(buildingDoc, year, opts);
      if (!validation.ok) {
            const err = new Error("Dữ liệu đầu vào không hợp lệ để tính EP");
            err.statusCode = 400;
            err.details = validation.issues;
            throw err;
      }

      const derived = validation.derived;
      const tf = computeTimeFactor(opts);

      // EP = (EEC / EFA) * TF
      const ep = (derived[EP_VARS.EEC] / derived[EP_VARS.EFA]) * tf;

      return {
            buildingId: buildingDoc.buildingId,
            buildingType: gi.buildingType,
            climateZone: gi.climateZone || null,
            year,

            inputs: {
                  [EP_VARS.GFA]: derived[EP_VARS.GFA],
                  [EP_VARS.CPA]: derived[EP_VARS.CPA],
                  [EP_VARS.DCA]: derived[EP_VARS.DCA],
                  [EP_VARS.GLA]: derived[EP_VARS.GLA],
                  [EP_VARS.FVR]: derived[EP_VARS.FVR],

                  [EP_VARS.TBEC]: derived[EP_VARS.TBEC],
                  [EP_VARS.CPEC]: derived[EP_VARS.CPEC],
                  [EP_VARS.DCEC]: derived[EP_VARS.DCEC]
            },

            normalised: {
                  [EP_VARS.EFA]: derived[EP_VARS.EFA],
                  [EP_VARS.EEC]: derived[EP_VARS.EEC],
                  [EP_VARS.TF]: tf,
                  [EP_VARS.AWH]: opts.AWH ?? null,
                  [EP_VARS.WOH]: opts.WOH ?? null
            },

            [EP_VARS.EP]: ep
      };
}

/**
 * Compute EP for all available years in consumedElectricity.
 */
function computeEnergyPerformanceAllYears(buildingDoc, opts = {}) {
      const years = listYearsFromMonthly(buildingDoc?.consumedElectricity || []);
      if (years.length === 0) {
            const err = new Error("Tòa nhà chưa có dữ liệu để tính EP");
            err.statusCode = 400;
            throw err;
      }
      return years.map((y) => computeEnergyPerformanceForYear(buildingDoc, y, opts));
}

module.exports = {
      // main APIs
      validateEpInputsForYear,
      computeEnergyPerformanceForYear,
      computeEnergyPerformanceAllYears,

      // helpers (để unit test)
      listYearsFromMonthly,
      sumKwhForYear,
      computeVacantRate,
      computeEffectiveFloorArea,
      computeTimeFactor
};
