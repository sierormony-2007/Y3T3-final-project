const svc = require('../services/authService');

async function register(req, res, next) {
  try { res.status(201).json(await svc.registerUser(req.body)); } catch (err) { next(err); }
}
async function login(req, res, next) {
  try { res.json(await svc.loginUser(req.body)); } catch (err) { next(err); }
}
async function getMe(req, res, next) {
  try { res.json(await svc.getUser(req.user.id)); } catch (err) { next(err); }
}
async function updateMe(req, res, next) {
  try { res.json(await svc.updateUser(req.user.id, req.body)); } catch (err) { next(err); }
}
async function getAllUsersCtrl(req, res, next) {
  try { res.json(await svc.getAllUsers()); } catch (err) { next(err); }
}

module.exports = { register, login, getMe, updateMe, getAllUsers: getAllUsersCtrl };