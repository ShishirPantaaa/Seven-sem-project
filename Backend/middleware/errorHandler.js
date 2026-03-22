/**
 * Centralized Error Handling Middleware
 * Standardizes error responses across the API
 */

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || 'INTERNAL_ERROR';

  console.error({
    timestamp: new Date().toISOString(),
    status,
    errorCode,
    message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  res.status(status).json({
    success: false,
    error: {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
    },
  });
};

class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  AppError,
};
