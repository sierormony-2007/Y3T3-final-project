const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Malformed authorization header' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'ecorecycle-secret-2026');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
