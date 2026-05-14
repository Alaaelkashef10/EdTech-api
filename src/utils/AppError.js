/**
 * Custom error class for operational errors (e.g. 404, 403).
 * These are expected errors we want to send back to the client.
 *
 * Usage:
 *   throw new AppError('Course not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Marks the error as operational (not a programming bug)
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
