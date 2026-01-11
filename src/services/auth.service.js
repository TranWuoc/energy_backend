const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

async function register(payload) {
      const { username, email, password, fullName, role } = payload;

      // Kiểm tra username hoặc email đã tồn tại
      const existingAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
      });

      if (existingAdmin) {
            throw {
                  statusCode: 400,
                  message:
                        existingAdmin.username === username
                              ? "Username đã tồn tại"
                              : "Email đã tồn tại"
            };
      }

      const admin = new Admin({
            username,
            email,
            password,
            fullName,
            role: role || "admin"
      });

      await admin.save();

      return {
            admin,
            token: generateToken(admin)
      };
}

async function login(payload) {
      const { username, password } = payload;

      // Tìm admin theo username hoặc email
      const admin = await Admin.findOne({
            $or: [{ username }, { email: username }]
      });

      if (!admin) {
            throw {
                  statusCode: 401,
                  message: "Tài khoản không tồn tại"
            };
      }

      if (!admin.isActive) {
            throw {
                  statusCode: 403,
                  message: "Tài khoản đã bị vô hiệu hóa"
            };
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
            throw {
                  statusCode: 401,
                  message: "Mật khẩu không chính xác"
            };
      }

      // Cập nhật thời gian đăng nhập
      admin.lastLogin = new Date();
      await admin.save();

      return {
            admin,
            token: generateToken(admin)
      };
}

async function getProfile(adminId) {
      const admin = await Admin.findById(adminId);
      if (!admin) {
            throw {
                  statusCode: 404,
                  message: "Không tìm thấy tài khoản"
            };
      }
      return admin;
}

async function changePassword(adminId, oldPassword, newPassword) {
      const admin = await Admin.findById(adminId);
      if (!admin) {
            throw {
                  statusCode: 404,
                  message: "Không tìm thấy tài khoản"
            };
      }

      const isMatch = await admin.comparePassword(oldPassword);
      if (!isMatch) {
            throw {
                  statusCode: 401,
                  message: "Mật khẩu cũ không chính xác"
            };
      }

      admin.password = newPassword;
      await admin.save();

      return { message: "Đổi mật khẩu thành công" };
}

function generateToken(admin) {
      return jwt.sign(
            {
                  id: admin._id,
                  username: admin.username,
                  role: admin.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
      );
}

function verifyToken(token) {
      return jwt.verify(token, JWT_SECRET);
}

module.exports = {
      register,
      login,
      getProfile,
      changePassword,
      generateToken,
      verifyToken
};
