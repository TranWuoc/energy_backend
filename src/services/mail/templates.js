// src/services/mail/templates.js
const env = require("../../config/env");

/**
 * HTML template dùng chung cho email
 * @param {string} title - tiêu đề email
 * @param {string} bodyHtml - nội dung HTML (đã escape/format bên ngoài)
 */
function baseHtml(title, bodyHtml) {
      return `
  <!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f6f6f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:24px;">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;color:#111;">
                  <h2 style="margin-top:0;">${title}</h2>
                  <div style="font-size:14px;line-height:1.6;">
                    ${bodyHtml}
                  </div>

                  <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />

                  <p style="font-size:12px;color:#777;margin:0;">
                    ${env.appName || "MyApp"} · 
                    <a href="${env.appUrl || "#"}" style="color:#0b5ed7;">
                      ${env.appUrl || ""}
                    </a>
                  </p>
                </td>
              </tr>
            </table>

            <p style="font-size:11px;color:#999;margin-top:12px;">
              Đây là email tự động, vui lòng không trả lời email này.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

/**
 * Fallback text/plain (tránh spam filter)
 * @param {string} title
 * @param {string} bodyText
 */
function textFallback(title, bodyText) {
      return `${title}

${bodyText}

---
${env.appName || "MyApp"}
${env.appUrl || ""}
`;
}

module.exports = {
      baseHtml,
      textFallback
};
