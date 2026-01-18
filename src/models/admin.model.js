const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
      {
            username: {
                  type: String,
                  required: true,
                  unique: true,
                  trim: true,
                  minlength: 3
            },
            email: {
                  type: String,
                  required: true,
                  unique: true,
                  trim: true,
                  lowercase: true
            },
            password: {
                  type: String,
                  required: true,
                  minlength: 6
            },
            fullName: {
                  type: String,
                  required: true
            },
            role: {
                  type: String,
                  enum: ["admin", "super_admin"],
                  default: "admin"
            },
            isActive: {
                  type: Boolean,
                  default: true
            },
            lastLogin: {
                  type: Date,
                  default: null
            }
      },
      {
            timestamps: true
      }
);

adminSchema.pre("save", async function () {
      if (!this.isModified("password")) return;

      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.toJSON = function () {
      const obj = this.toObject();
      delete obj.password;
      return obj;
};

module.exports = mongoose.model("Admin", adminSchema);
