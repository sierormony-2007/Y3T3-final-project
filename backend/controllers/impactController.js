const svc = require('../services/impactViews');

async function getUserImpact(req, res, next) {
  try { res.json(await svc.getUserImpact(req.user.id)); } catch (err) { next(err); }
}
async function getAllImpact(req, res, next) {
  try { res.json(await svc.getAllImpact()); } catch (err) { next(err); }
}

module.exports = { getUserImpact, getAllImpact };