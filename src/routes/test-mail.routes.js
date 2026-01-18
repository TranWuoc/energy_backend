const { Router } = require("express");
const { z } = require("zod");
const env = require("../config/env");
const { NotificationService } = require("../services/notification.service");

const router = Router();
const notifier = new NotificationService();

const TestEmailSchema = z.object({
      to: z.string().email("Email không hợp lệ"),
      title: z.string().min(1).max(120).optional(),
      message: z.string().min(1).max(3000).optional()
});

function isAllowedDomain(email) {
      const allowed = env.mailAllowedDomains || [];
      if (allowed.length === 0) return true;
      const domain = (email.split("@")[1] || "").toLowerCase();
      return allowed.includes(domain);
}

router.post("/test-email", async (req, res) => {
      try {
            const parsed = TestEmailSchema.safeParse(req.body);
            if (!parsed.success) {
                  return res.status(400).json({
                        ok: false,
                        error: "INVALID_INPUT",
                        details: parsed.error.flatten()
                  });
            }

            const { to, title, message } = parsed.data;

            if (!isAllowedDomain(to)) {
                  return res.status(403).json({
                        ok: false,
                        error: "EMAIL_DOMAIN_NOT_ALLOWED",
                        allowedDomains: env.mailAllowedDomains
                  });
            }

            const result = await notifier.notify({
                  event: "GENERIC",
                  to,
                  data: {
                        title: title || "Dev test email",
                        message: message || `Hello from ${env.appName || "MyApp"} 👋`
                  }
            });

            return res.json({
                  ok: true,
                  provider: env.mailProvider,
                  to,
                  result
            });
      } catch (err) {
            console.error("[test-email] error:", err);
            return res.status(500).json({
                  ok: false,
                  error: "INTERNAL_SERVER_ERROR",
                  message: err?.message || "Unknown error"
            });
      }
});

module.exports = router;
