const { sendMail } = require("./mail");
const { baseHtml, textFallback } = require("./mail/templates");
const { renderBuildingFullHtml, escapeHtml } = require("./mail/templates/building-full.table");

function buildEmail(event, data) {
      switch (event) {
            case "BUILDING_CREATED": {
                  const building = data.building;
                  const subject = "Cảm ơn đã tham gia khảo sát";

                  if (!building) {
                        return {
                              subject,
                              htmlBody: `<p>${escapeHtml(
                                    "Tạo tòa nhà thành công, nhưng không có dữ liệu chi tiết để hiển thị."
                              )}</p>`,
                              textBody: "Tạo tòa nhà thành công."
                        };
                  }

                  return {
                        subject,
                        htmlBody: renderBuildingFullHtml(building),
                        textBody: `Tạo tòa nhà thành công. Building ID: ${
                              building.buildingId || "-"
                        }`
                  };
            }

            case "SYSTEM_ALERT": {
                  const title = data.title || "System alert";
                  const message = data.message || "(no message)";
                  return {
                        subject: `[ALERT] ${title}`,
                        htmlBody: `<p>${escapeHtml(message)}</p>`,
                        textBody: message
                  };
            }

            default: {
                  const title = data.title || "Notification";
                  const message = data.message || "Hello";
                  return {
                        subject: title,
                        htmlBody: `<p>${escapeHtml(message)}</p>`,
                        textBody: message
                  };
            }
      }
}

class NotificationService {
      async notify({ event = "GENERIC", to, data = {} }) {
            if (!to) return { ok: false, error: "MISSING_EMAIL" };

            const email = buildEmail(event, data);

            const info = await sendMail({
                  to,
                  subject: email.subject,
                  html: baseHtml(email.subject, email.htmlBody),
                  text: textFallback(email.subject, email.textBody)
            });

            return { ok: true, messageId: info.messageId };
      }
}

module.exports = { NotificationService };
