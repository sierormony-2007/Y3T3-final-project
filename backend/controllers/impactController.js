const svc = require('../services/impactService');

function getUserImpact(req, res, next) {
  try { res.json(svc.getUserImpact(req.user.id)); } catch (err) { next(err); }
}
function getAllImpact(req, res, next) {
  try { res.json(svc.getAllImpact()); } catch (err) { next(err); }
}

module.exports = { getUserImpact, getAllImpact };
