const svc = require('../services/userService');

async function getUsers(req, res, next) {
  try { res.json(await svc.getAllUsers()); } catch (err) { next(err); }
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
