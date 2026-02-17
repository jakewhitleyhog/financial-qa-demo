/**
 * Error Handler Middleware
 * Centralized error handling for Express
 */

/**
 * Global error handler
 * Catches all errors and returns standardized error responses
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error status and message
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
}

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
}

export default {
  errorHandler,
  notFoundHandler
};
