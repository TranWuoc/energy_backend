const mongoose = require("mongoose");
const Admin = require("../models/admin.model");
require("dotenv").config();

async function createSuperAdmin() {
      try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected to MongoDB");

            const existingAdmin = await Admin.findOne({ role: "super_admin" });
            if (existingAdmin) {
                  console.log("Super admin already exists:", existingAdmin.username);
                  process.exit(0);
            }

            const superAdmin = new Admin({
                  username: "superadmin",
                  email: "admin@energy.com",
                  password: "admin123456", // Đổi password sau khi tạo
                  fullName: "Super Administrator",
                  role: "super_admin"
            });

            await superAdmin.save();
            console.log("Super admin created successfully!");
            console.log("Username: superadmin");
            console.log("Password: admin123456");
            console.log("⚠️  Hãy đổi mật khẩu ngay sau khi đăng nhập!");

            process.exit(0);
      } catch (err) {
            console.error("Error:", err.message);
            process.exit(1);
      }
}

createSuperAdmin();
