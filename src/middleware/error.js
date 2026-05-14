/**
 * Global Express error-handling middleware.
 * Must have 4 parameters so Express recognises it as an error handler.
 *
 * Handles:
 *  - Custom AppError instances (operational errors)
 *  - MongoDB duplicate-key errors (code 11000)
 *  - Mongoose CastError (invalid ObjectId)
 *  - All other unexpected errors (500)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // MongoDB duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message    = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose cast error (e.g. bad ObjectId in URL)
  if (err.name === 'CastError') {
    message    = 'Invalid ID format';
    statusCode = 400;
  }

  // Log unexpected server errors for debugging
  if (statusCode === 500) {
    console.error('[Server Error]', err);
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
