require("dotenv").config({
      quiet: true
});

const env = {
      nodeEnv: process.env.NODE_ENV || "development",
      port: Number(process.env.PORT) || 3000,
      mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/energy_benchmarking",

      appName: process.env.APP_NAME || "MyApp",
      appUrl: process.env.APP_URL || "http://localhost:3000",

      mailProvider: process.env.MAIL_PROVIDER || "mailtrap", // mailtrap | gmail | smtp

      mailFromName: process.env.MAIL_FROM_NAME || "MyApp",
      mailFromEmail: process.env.MAIL_FROM_EMAIL || "no-reply@myapp.local",

      // Mailtrap (DEV)
      mailtrap: {
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT ? Number(process.env.MAILTRAP_PORT) : undefined,
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS
      },

      // Gmail (deploy nhanh)
      gmail: {
            user: process.env.GMAIL_USER,
            appPassword: process.env.GMAIL_APP_PASSWORD
      },

      // Generic SMTP (deploy chuẩn)
      smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            secure: process.env.SMTP_SECURE === "true" // "true"/"false"
      },

      // Optional: giới hạn domain email được phép gửi (dev tránh bị abuse)
      // ví dụ: MAIL_ALLOWED_DOMAINS=gmail.com,company.com
      mailAllowedDomains: (process.env.MAIL_ALLOWED_DOMAINS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
};

module.exports = env;
