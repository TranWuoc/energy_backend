const env = require("../../config/env");
const { getMailer } = require("./mailer");

/**
 * @param {Object} params
 * @param {string|string[]} params.to
 * @param {string} params.subject
 * @param {string=} params.text
 * @param {string=} params.html
 */
async function sendMail({ to, subject, text, html }) {
      const transporter = getMailer();

      const toValue = Array.isArray(to) ? to.join(",") : to;

      const info = await transporter.sendMail({
            from: `"${env.mailFromName}" <${env.mailFromEmail}>`,
            to: toValue,
            subject,
            text,
            html
      });

      return info; // { messageId, accepted, rejected, ... }
}

module.exports = { sendMail };
