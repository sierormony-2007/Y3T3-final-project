const { registerUser, loginUser, getUser, updateUser, getAllUsers } = require('../services/authService');

async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

function getMe(req, res, next) {
  try { res.json(getUser(req.user.id)); } catch (err) { next(err); }
}

function updateMe(req, res, next) {
  try { res.json(updateUser(req.user.id, req.body)); } catch (err) { next(err); }
}

function getAllUsersCtrl(req, res, next) {
  try { res.json(getAllUsers()); } catch (err) { next(err); }
}

module.exports = { register, login, getMe, updateMe, getAllUsers: getAllUsersCtrl };
