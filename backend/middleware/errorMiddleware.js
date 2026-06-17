/**
 * Centralized error handling middleware.
 * Services throw { status, message } objects; anything else is a 500.
 */
function errorMiddleware(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  if (status === 500) console.error('[ERROR]', err);
  res.status(status).json({ message });
}

module.exports = errorMiddleware;
