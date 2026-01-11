const authService = require("../services/auth.service");

// POST /api/auth/register
async function register(req, res, next) {
      try {
            const result = await authService.register(req.body);

            return res.status(201).json({
                  success: true,
                  message: "Đăng ký thành công",
                  data: {
                        admin: result.admin,
                        token: result.token
                  }
            });
      } catch (err) {
            next(err);
      }
}

// POST /api/auth/login
async function login(req, res, next) {
      try {
            const { username, password } = req.body;

            if (!username && !password) {
                  return res.status(400).json({
                        success: false,
                        message: "Vui lòng nhập username và password"
                  });
            }

            if (!username) {
                  return res.status(400).json({
                        success: false,
                        message: "Vui lòng nhập username"
                  });
            }

            if (!password) {
                  return res.status(400).json({
                        success: false,
                        message: "Vui lòng nhập password"
                  });
            }

            const result = await authService.login({ username, password });

            return res.json({
                  success: true,
                  message: "Đăng nhập thành công",
                  data: {
                        admin: result.admin,
                        token: result.token
                  }
            });
      } catch (err) {
            next(err);
      }
}

// GET /api/auth/profile
async function getProfile(req, res, next) {
      try {
            const admin = await authService.getProfile(req.admin.id);

            return res.json({
                  success: true,
                  data: admin
            });
      } catch (err) {
            next(err);
      }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
      try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                  return res.status(400).json({
                        success: false,
                        message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới"
                  });
            }

            if (newPassword.length < 6) {
                  return res.status(400).json({
                        success: false,
                        message: "Mật khẩu mới phải có ít nhất 6 ký tự"
                  });
            }

            const result = await authService.changePassword(req.admin.id, oldPassword, newPassword);

            return res.json({
                  success: true,
                  message: result.message
            });
      } catch (err) {
            next(err);
      }
}

// POST /api/auth/logout
async function logout(req, res, next) {
      try {
            // Với JWT stateless, logout chỉ cần FE xóa token
            // Có thể implement blacklist token nếu cần
            return res.json({
                  success: true,
                  message: "Đăng xuất thành công"
            });
      } catch (err) {
            next(err);
      }
}

module.exports = {
      register,
      login,
      getProfile,
      changePassword,
      logout
};
