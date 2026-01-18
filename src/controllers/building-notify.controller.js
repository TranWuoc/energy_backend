const { z } = require("zod");
const Building = require("../models/building.model");
const { NotificationService } = require("../services/notification.service");

const notifier = new NotificationService();

const Schema = z.object({
      buildingId: z.string().min(1),
      title: z.string().min(1),
      message: z.string().min(1)
});

exports.sendBuildingEmail = async (req, res) => {
      const parsed = Schema.safeParse(req.body);
      if (!parsed.success) {
            return res.status(400).json({ ok: false, error: parsed.error.flatten() });
      }

      const { buildingId, title, message } = parsed.data;

      const building = await Building.findOne({ buildingId }).lean();
      if (!building) return res.status(404).json({ ok: false, error: "BUILDING_NOT_FOUND" });

      const to = building.user?.email;
      if (!to) return res.status(400).json({ ok: false, error: "EMAIL_NOT_FOUND" });

      const result = await notifier.notify({
            event: "GENERIC",
            to,
            data: { title, message }
      });

      return res.json({ ok: true, to, result });
};
