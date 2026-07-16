const bcrypt = require('bcryptjs');
const { User } = require('../models');

const SALT_ROUNDS = 10;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200; // hard cap — no request can ever pull the whole table into memory

function sanitize(user) {
  const plain = user.toJSON ? user.toJSON() : user;
  const { password_hash, ...safe } = plain;
  // Keep original DB field names but also add the aliases the frontend
  // expects (id/name/points), same convention as authService.sanitize.
  return {
    ...safe,
    id: safe.user_id,
    name: safe.full_name,
    points: safe.total_points,
  };
}

async function getAllUsers({ page = 1, limit = DEFAULT_LIMIT } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  const offset = (safePage - 1) * safeLimit;

  const { rows, count } = await User.findAndCountAll({
    order: [['user_id', 'ASC']],
    limit: safeLimit,
    offset,
    attributes: { exclude: ['password_hash'] }, // don't even pull hashes out of the DB
  });

  return {
    users: rows.map(sanitize),
    total: count,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(count / safeLimit),
  };
}

async function getUserById(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return sanitize(user);
}

async function createUser({ full_name, email, password, phone, address, city, latitude, longitude, role, account_status }) {
  if (!full_name || !email || !password) {
    throw { status: 400, message: 'full_name, email, and password are required' };
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw { status: 409, message: 'Email already registered' };
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    full_name,
    email,
    password_hash,
    phone,
    address,
    city,
    latitude,
    longitude,
    role: role || 'user',
    account_status: account_status || 'active',
  });

  return sanitize(user);
}

async function updateUser(userId, updates) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  // Fields allowed to be updated via this endpoint.
  const allowed = [
    'full_name', 'phone', 'address', 'city',
    'latitude', 'longitude', 'account_status', 'role', 'total_points',
  ];

  if (updates.email && updates.email !== user.email) {
    const existing = await User.findOne({ where: { email: updates.email } });
    if (existing) {
      throw { status: 409, message: 'Email already registered' };
    }
    user.email = updates.email;
  }

  if (updates.password) {
    user.password_hash = await bcrypt.hash(updates.password, SALT_ROUNDS);
  }

  Object.keys(updates)
    .filter((key) => allowed.includes(key))
    .forEach((key) => {
      user[key] = updates[key];
    });

  await user.save();
  return sanitize(user);
}

async function deleteUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  await user.destroy();
  return { message: 'User deleted successfully', user_id: Number(userId) };
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};