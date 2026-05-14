/**
 * Wraps an async route handler so that any thrown error is forwarded
 * to Express's error-handling middleware automatically.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
