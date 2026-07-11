const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'ecorecycle-secret-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

function sanitize(user) {
  const plain = user.toJSON ? user.toJSON() : user;
  const { password_hash, ...safe } = plain;
  // The frontend was built expecting shorter aliases (id/name/points) —
  // keep the original DB field names too, but add the aliases so every
  // page (Header, Dashboard, MyImpact, StaffDashboard, RewardsStore...)
  // reads the correct value instead of `undefined`.
  return {
    ...safe,
    id: safe.user_id,
    name: safe.full_name,
    points: safe.total_points,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role || 'user',
      // Only relevant for role='staff': 'admin' vs 'operator'.
      staff_role: user.staff_role || null,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}


async function registerUser({ full_name, email, password, phone, address, city, latitude, longitude }) {
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
  });

  return { user: sanitize(user), token: signToken(user) };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw { status: 400, message: 'email and password are required' };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  return { user: sanitize(user), token: signToken(user) };
}

async function getUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return sanitize(user);
}

async function updateUser(userId, updates) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  const allowed = ['full_name', 'phone', 'address', 'city', 'latitude', 'longitude'];
  const fields = Object.keys(updates).filter((key) => allowed.includes(key));
  fields.forEach((key) => {
    user[key] = updates[key];
  });

  await user.save();
  return sanitize(user);
}

async function getAllUsers() {
  const users = await User.findAll();
  return users.map(sanitize);
}

module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  getAllUsers,
};
