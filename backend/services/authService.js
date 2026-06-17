const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ecorecycle-secret-2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

async function registerUser({ name, email, password }) {
  if (!name || !email || !password) throw { status: 400, message: 'All fields are required' };
  if (password.length < 3) throw { status: 400, message: 'Password must be at least 3 characters' };

  const exists = db.get('users').find({ email }).value();
  if (exists) throw { status: 409, message: 'Email already registered' };

  const users = db.get('users').value();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const hashed = await bcrypt.hash(password, 8);
  const newUser = { id: newId, name, email, password: hashed, role: 'user', points: 0 };

  db.get('users').push(newUser).write();
  console.log(`REGISTER: "${name}" <${email}> id=${newId}`);
  return { token: makeToken(newUser), user: safeUser(newUser) };
}

async function loginUser({ email, password }) {
  if (!email || !password) throw { status: 400, message: 'Email and password are required' };

  const user = db.get('users').find({ email }).value();
  if (!user) throw { status: 401, message: 'Invalid email or password' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Invalid email or password' };

  console.log(`LOGIN: "${user.name}" role=${user.role}`);
  return { token: makeToken(user), user: safeUser(user) };
}

function getUser(id) {
  const user = db.get('users').find({ id }).value();
  if (!user) throw { status: 404, message: 'User not found' };
  return safeUser(user);
}

function updateUser(id, { name }) {
  const update = {};
  if (name !== undefined) update.name = name;
  db.get('users').find({ id }).assign(update).write();
  return safeUser(db.get('users').find({ id }).value());
}

function getAllUsers() {
  return db.get('users').value().map(safeUser);
}

module.exports = { registerUser, loginUser, getUser, updateUser, getAllUsers };
