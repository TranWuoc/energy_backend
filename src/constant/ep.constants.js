module.exports.EP_VARS = {
      // Electricity (kWh/year)
      TBEC: "TBEC", // Total Building Electricity Consumption
      CPEC: "CPEC", // Car Park Electricity Consumption
      DCEC: "DCEC", // Data Centre Electricity Consumption
      EEC: "EEC", // Effective Electricity Consumption

      // Areas (m²)
      GFA: "GFA", // Gross Floor Area
      CPA: "CPA", // Car Park Area
      DCA: "DCA", // Data Centre Area
      GLA: "GLA", // Gross Lettable Area
      FVR: "FVR", // Vacancy Rate (0..1)
      EFA: "EFA", // Effective Floor Area

      // Time normalisation
      AWH: "AWH", // Actual Working Hours
      WOH: "WOH", // Standard Working Hours
      TF: "TF", // Time Factor

      // Result
      EP: "EP" // Energy Performance (kWh/m².year)
};

module.exports.EP_DEFAULTS = {
      TF: 1 // Default Time Factor
};
