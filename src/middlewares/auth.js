const authService = require("../services/auth.service");

function authenticate(req, res, next) {
      try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                  return res.status(401).json({
                        success: false,
                        message: "Không có token xác thực"
                  });
            }

            const token = authHeader.split(" ")[1];
            const decoded = authService.verifyToken(token);

            req.admin = decoded;
            next();
      } catch (err) {
            if (err.name === "TokenExpiredError") {
                  return res.status(401).json({
                        success: false,
                        message: "Token đã hết hạn"
                  });
            }
            return res.status(401).json({
                  success: false,
                  message: "Token không hợp lệ"
            });
      }
}

function authorize(...roles) {
      return (req, res, next) => {
            if (!req.admin) {
                  return res.status(401).json({
                        success: false,
                        message: "Chưa xác thực"
                  });
            }

            if (!roles.includes(req.admin.role)) {
                  return res.status(403).json({
                        success: false,
                        message: "Không có quyền truy cập"
                  });
            }

            next();
      };
}

module.exports = {
      authenticate,
      authorize
};
