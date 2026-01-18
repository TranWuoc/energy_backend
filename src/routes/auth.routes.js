const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middlewares/auth");

router.post("/login", authController.login);

router.get("/profile", authenticate, authController.getProfile);
router.put("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

router.post("/register", authenticate, authorize("super_admin"), authController.register);

module.exports = router;
