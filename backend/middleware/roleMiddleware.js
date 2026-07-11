function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

// Extra gate for actions restricted to staff admins (e.g. add/delete
// Rewards Store items). Regular ("operator") staff are blocked here even
// though they pass the plain role('staff') check.
function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'staff' || req.user.staff_role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin staff only' });
  }
  next();
}

module.exports = roleMiddleware;
module.exports.adminOnly = adminOnly;
