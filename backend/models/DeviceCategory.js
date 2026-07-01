const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DeviceCategory = sequelize.define('DeviceCategory', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: DataTypes.TEXT,
  points_per_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: { args: [0.01], msg: 'points_per_kg must be > 0' } },
  },
}, {
  tableName: 'device_categories',
  timestamps: false,
});

module.exports = DeviceCategory;
