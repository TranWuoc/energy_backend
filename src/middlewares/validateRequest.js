function validateRequest(schema) {
      if (!schema) return next();
      return (req, res, next) => {
            const options = {
                  abortEarly: false,
                  allowUnknown: true,
                  stripUnknown: false
            };

            const { error, value } = schema.validate(req.body, options);

            if (error) {
                  return res.status(400).json({
                        message: "Validation error (Joi)",
                        details: error.details.map((detail) => detail.message)
                  });
            }

            req.body = value;
            next();
      };
}

module.exports = validateRequest;
