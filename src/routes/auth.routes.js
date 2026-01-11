const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Public routes
router.post("/login", authController.login);

// Protected routes (cần đăng nhập)
router.get("/profile", authenticate, authController.getProfile);
router.put("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

// Super admin only (tạo tài khoản admin mới)
router.post("/register", authenticate, authorize("super_admin"), authController.register);

module.exports = router;
