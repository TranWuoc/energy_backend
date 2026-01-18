const nodemailer = require("nodemailer");
const env = require("../../config/env");

let cachedTransporter = null;

function buildTransporter(provider) {
      if (provider === "mailtrap") {
            const { host, port, user, pass } = env.mailtrap || {};
            if (!host || !port || !user || !pass) {
                  throw new Error("Missing Mailtrap env vars (MAILTRAP_HOST/PORT/USER/PASS)");
            }
            return nodemailer.createTransport({
                  host,
                  port,
                  auth: { user, pass }
            });
      }

      if (provider === "gmail") {
            const { user, appPassword } = env.gmail || {};
            if (!user || !appPassword) {
                  throw new Error("Missing Gmail env vars (GMAIL_USER/GMAIL_APP_PASSWORD)");
            }
            return nodemailer.createTransport({
                  service: "gmail",
                  auth: { user, pass: appPassword }
            });
      }

      // provider === "smtp"
      const { host, port, user, pass, secure } = env.smtp || {};
      if (!host || !port || !user || !pass) {
            throw new Error("Missing SMTP env vars (SMTP_HOST/PORT/USER/PASS)");
      }

      return nodemailer.createTransport({
            host,
            port,
            secure: Boolean(secure),
            auth: { user, pass }
      });
}

function getMailer() {
      if (!cachedTransporter) {
            cachedTransporter = buildTransporter(env.mailProvider);
      }
      console.log("[MAILTRAP_CFG]", {
            host: env.mailtrap?.host,
            port: env.mailtrap?.port,
            user: env.mailtrap?.user ? "set" : "missing",
            pass: env.mailtrap?.pass ? "set" : "missing"
      });
      return cachedTransporter;
}

module.exports = { getMailer };
