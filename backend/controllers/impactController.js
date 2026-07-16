const svc = require('../services/impactViews');

async function getUserImpact(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      // If this fires, the auth middleware isn't attaching req.user.id the
      // way this controller expects — check the JWT payload key (e.g. it
      // may be req.user.user_id instead of req.user.id).
      return res.status(401).json({ message: 'Unauthorized — user not identified' });
    }
    res.json(await svc.getUserImpact(req.user.id));
  } catch (err) { next(err); }
}

async function getAllImpact(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await svc.getAllImpact({ page, limit });

    res.set('X-Total-Count', result.total);
    res.set('X-Total-Pages', result.totalPages);
    res.set('X-Page', result.page);
    res.json(result.impact); // body stays a plain array — no frontend changes needed
  } catch (err) { next(err); }
}

module.exports = { getUserImpact, getAllImpact };