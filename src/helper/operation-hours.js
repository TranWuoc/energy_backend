function parseHHmmToMinutes(s) {
      if (s == null) return null;
      if (typeof s !== "string") return null;
      const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;

      const hh = Number(m[1]);
      const mm = Number(m[2]);
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

      return hh * 60 + mm;
}

function hoursFromTimeRange(range) {
      if (!range) return 0;
      const fromMin = parseHHmmToMinutes(range.from);
      const toMin = parseHHmmToMinutes(range.to);
      if (fromMin == null || toMin == null) return 0;

      let diff = toMin - fromMin;
      if (diff < 0) diff += 24 * 60;
      return diff / 60;
}

function zoneHoursPerWeek(z) {
      const wd = hoursFromTimeRange(z.weekday);
      const sat = hoursFromTimeRange(z.saturday);
      const sun = hoursFromTimeRange(z.sunday);
      return {
            weekdayPerDay: wd,
            saturdayPerDay: sat,
            sundayPerDay: sun,
            perWeek: wd * 5 + sat + sun
      };
}

function computeAWHBuildingWeekly(zones = []) {
      const daily = zones.map((z) => zoneHoursPerWeek(z));

      const maxWeekday = daily.reduce((m, x) => Math.max(m, x.weekdayPerDay), 0);
      const maxSaturday = daily.reduce((m, x) => Math.max(m, x.saturdayPerDay), 0);
      const maxSunday = daily.reduce((m, x) => Math.max(m, x.sundayPerDay), 0);

      return {
            AWH_week: maxWeekday * 5 + maxSaturday + maxSunday,
            buildingDailyMax: { maxWeekday, maxSaturday, maxSunday }
      };
}

function computeWOHRentalWeeklyWeighted(zones = []) {
      const rented = (zones || []).filter((z) => z.isRented === true);

      if (rented.length === 0) {
            return { WOH_week: null, rentedZonesCount: 0, rentedAreaSum: 0 };
      }

      let areaSum = 0;
      let weightedSum = 0;

      for (const z of rented) {
            const area = Number(z.rentableArea);
            if (!Number.isFinite(area) || area <= 0) continue;

            const wh = zoneHoursPerWeek(z).perWeek;
            areaSum += area;
            weightedSum += area * wh;
      }

      if (areaSum === 0) {
            return { WOH_week: null, rentedZonesCount: rented.length, rentedAreaSum: 0 };
      }

      return {
            WOH_week: weightedSum / areaSum,
            rentedZonesCount: rented.length,
            rentedAreaSum: areaSum
      };
}

function computeWorkingHours({ buildingType, operation }) {
      const zones =
            buildingType === 1
                  ? operation?.governmentZones || []
                  : operation?.commercialZones || [];

      const zoneDebug = zones.map((z) => ({
            zoneCode: z.zoneCode,
            isRented: !!z.isRented,
            rentableArea: z.rentableArea ?? null,
            ...zoneHoursPerWeek(z)
      }));

      const { AWH_week, buildingDailyMax } = computeAWHBuildingWeekly(zones);

      const woh =
            buildingType === 2
                  ? computeWOHRentalWeeklyWeighted(zones)
                  : { WOH_week: null, rentedZonesCount: 0, rentedAreaSum: 0 };

      return {
            AWH_week,
            WOH_week: woh.WOH_week,
            buildingDailyMax,
            rentedZonesCount: woh.rentedZonesCount,
            rentedAreaSum: woh.rentedAreaSum,
            zones: zoneDebug
      };
}

module.exports = { computeWorkingHours };
