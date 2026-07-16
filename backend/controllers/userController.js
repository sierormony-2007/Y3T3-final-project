const svc = require('../services/userService');

async function getUsers(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await svc.getAllUsers({ page, limit });

    res.set('X-Total-Count', result.total);
    res.set('X-Total-Pages', result.totalPages);
    res.set('X-Page', result.page);
    res.json(result.users); // body stays a plain array — no frontend changes needed
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try { res.json(await svc.getUserById(req.params.id)); } catch (err) { next(err); }
}

async function createUser(req, res, next) {
  try { res.status(201).json(await svc.createUser(req.body)); } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try { res.json(await svc.updateUser(req.params.id, req.body)); } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try { res.json(await svc.deleteUser(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };