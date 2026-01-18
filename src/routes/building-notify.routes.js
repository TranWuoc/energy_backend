const { Router } = require("express");
const { sendBuildingEmail } = require("../controllers/building-notify.controller");

const router = Router();

router.post("/buildings/notify-email", sendBuildingEmail);

module.exports = router;
