const escapeHtml = (str = "") =>
      String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

const fmt = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));
const fmtTime = (t) => (t ? String(t) : "-");

function sectionTitle(text) {
      return `<h3 style="margin:18px 0 10px;">${escapeHtml(text)}</h3>`;
}

function kvTable(rows) {
      return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    ${rows.join("")}
  </table>`;
}

function kvRow(label, value) {
      return `
    <tr>
      <td style="padding:8px 12px;border:1px solid #eee;font-weight:600;background:#fafafa;width:35%;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:8px 12px;border:1px solid #eee;">
        ${escapeHtml(fmt(value))}
      </td>
    </tr>`;
}

function generalInfoSection(generalInfo = {}, user = {}, buildingId = "") {
      const rows = [
            kvRow("Building ID", buildingId),
            kvRow("Tên tòa nhà", generalInfo.name),
            kvRow("Loại tòa nhà", generalInfo.buildingType),
            kvRow("Địa chỉ", generalInfo.address),
            kvRow("Diện tích (m²)", generalInfo.totalArea),
            kvRow("Số tầng", generalInfo.numberOfFloors),
            kvRow("Năm xây dựng", generalInfo.yearBuilt),
            kvRow("Ghi chú", generalInfo.note),

            // user info
            kvRow("Người tạo", user.fullName),
            kvRow("Email", user.email),
            kvRow("SĐT", user.phone)
      ];

      return sectionTitle("1) General Information") + kvTable(rows);
}

// Operation zones (governmentZones) — nếu bạn có thêm các mảng zones khác thì add tiếp
function operationSection(operation = {}) {
      const zones = operation.governmentZones || [];
      if (!zones.length) {
            return (
                  sectionTitle("2) Operation") +
                  `<p style="margin:0;"><i>Không có dữ liệu vận hành.</i></p>`
            );
      }

      const header = `
    <tr style="background:#f1f1f1;font-weight:600;">
      <td style="border:1px solid #eee;padding:8px;">Zone</td>
      <td style="border:1px solid #eee;padding:8px;">Rented</td>
      <td style="border:1px solid #eee;padding:8px;">Weekday</td>
      <td style="border:1px solid #eee;padding:8px;">Saturday</td>
      <td style="border:1px solid #eee;padding:8px;">Sunday</td>
      <td style="border:1px solid #eee;padding:8px;">Utilisation</td>
      <td style="border:1px solid #eee;padding:8px;">Avg people</td>
      <td style="border:1px solid #eee;padding:8px;">Note</td>
    </tr>
  `;

      const body = zones
            .map((z, idx) => {
                  const weekday = `${fmtTime(z.weekday?.from)} → ${fmtTime(z.weekday?.to)}`;
                  const saturday = `${fmtTime(z.saturday?.from)} → ${fmtTime(z.saturday?.to)}`;
                  const sunday = `${fmtTime(z.sunday?.from)} → ${fmtTime(z.sunday?.to)}`;

                  return `
      <tr>
        <td style="border:1px solid #eee;padding:8px;">Zone ${idx + 1}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(z.isRented))}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(weekday)}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(saturday)}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(sunday)}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(z.utilisationLevel))}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(z.averagePeople))}</td>
        <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(z.note))}</td>
      </tr>`;
            })
            .join("");

      return (
            sectionTitle("2) Operation") +
            `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${header}
      ${body}
    </table>
    `
      );
}

function consumedElectricitySection(consumedElectricity = []) {
      if (!Array.isArray(consumedElectricity) || consumedElectricity.length === 0) {
            return (
                  sectionTitle("3) Consumed Electricity") +
                  `<p style="margin:0;"><i>Không có dữ liệu điện năng.</i></p>`
            );
      }

      // Mỗi yearBlock một bảng
      return (
            sectionTitle("3) Consumed Electricity") +
            consumedElectricity
                  .map((y) => {
                        const year = y.year ?? "-";
                        const source = y.dataSource ?? "-";
                        const months = Array.isArray(y.monthlyData) ? y.monthlyData : [];

                        const header = `
          <tr style="background:#f1f1f1;font-weight:600;">
            <td style="border:1px solid #eee;padding:8px;">Year</td>
            <td style="border:1px solid #eee;padding:8px;">Data source</td>
          </tr>
          <tr>
            <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(year))}</td>
            <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(source))}</td>
          </tr>
        `;

                        const monthHeader = `
          <tr style="background:#f9f9f9;font-weight:600;">
            <td style="border:1px solid #eee;padding:8px;">Month</td>
            <td style="border:1px solid #eee;padding:8px;">Consumption (kWh)</td>
          </tr>
        `;

                        const monthRows = months
                              .map((m) => {
                                    const month = m.month ?? "-";
                                    const kwh = m.energyConsumption ?? 0;
                                    return `
              <tr>
                <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(month))}</td>
                <td style="border:1px solid #eee;padding:8px;">${escapeHtml(fmt(kwh))}</td>
              </tr>`;
                              })
                              .join("");

                        return `
          <div style="margin-top:12px;">
            <h4 style="margin:10px 0;">Năm ${escapeHtml(fmt(year))}</h4>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:10px;">
              ${header}
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              ${monthHeader}
              ${
                    monthRows ||
                    `<tr><td colspan="2" style="border:1px solid #eee;padding:8px;"><i>No monthly data</i></td></tr>`
              }
            </table>
          </div>
        `;
                  })
                  .join("")
      );
}

function renderBuildingFullHtml(building) {
      const user = building?.user || {};
      const generalInfo = building?.generalInfo || {};
      const operation = building?.operation || {};
      const consumedElectricity = building?.consumedElectricity || [];
      const buildingId = building?.buildingId || "-";

      return `
    <p style="margin:0 0 12px;">Bạn đã tạo tòa nhà thành công. Dưới đây là thông tin chi tiết:</p>
    ${generalInfoSection(generalInfo, user, buildingId)}
    ${operationSection(operation)}
    ${consumedElectricitySection(consumedElectricity)}
  `;
}

module.exports = { renderBuildingFullHtml, escapeHtml };
