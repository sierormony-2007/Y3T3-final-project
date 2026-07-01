const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserImpact = sequelize.define('UserImpact', {
  impact_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  total_devices: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  total_weight_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  co2_saved_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  toxins_diverted_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  total_pickups: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
}, {
  tableName: 'user_impact',
  timestamps: true,
  createdAt: false,
  updatedAt: 'last_updated',
});

module.exports = UserImpact;
