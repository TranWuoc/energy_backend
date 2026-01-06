require("dotenv").config({
      quite: true
});

const env = {
      port: process.env.PORT || 3000,
      mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/energy_benchmarking"
};

module.exports = env;
