function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  // Lỗi validate của Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: err.message
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
}

module.exports = errorHandler;  