const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false, // always store a bcrypt hash, never plaintext
  },
  phone: DataTypes.STRING(20),
  address: DataTypes.TEXT,
  city: DataTypes.STRING(50),
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    validate: { min: -90, max: 90 },
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    validate: { min: -180, max: 180 },
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  account_status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    allowNull: false,
    defaultValue: 'active',
  },

  role: {
  type: DataTypes.ENUM('user', 'staff'),
  allowNull: false,
  defaultValue: 'user',
},

  // Only meaningful when role = 'staff'. 'admin' can manage the Rewards
  // Store (add/delete items); 'operator' is a regular staff member and
  // cannot. Left null for role = 'user'.
  staff_role: {
    type: DataTypes.ENUM('operator', 'admin'),
    allowNull: true,
    defaultValue: null,
  },

}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['city'] },
    { fields: ['account_status'] },
  ],
});

module.exports = User;