function errorHandler(err, req, res, next) {
      console.error("[Error]", err);

      if (err.name === "ValidationError") {
            return res.status(400).json({
                  message: "Validation error",
                  details: err.message
            });
      }

      if (err.statusCode) {
            return res.status(err.statusCode).json({
                  message: err.message,
                  details: err.details || null
            });
      }

      return res.status(500).json({
            message: "Internal server error",
            error: err.message
      });
}

module.exports = errorHandler;
