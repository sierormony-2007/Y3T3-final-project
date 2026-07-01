const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RequestDevice = sequelize.define('RequestDevice', {
  device_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: { args: [1], msg: 'quantity must be > 0' } },
  },
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    validate: { min: 0 },
  },
  // Trailing underscore avoids clashing with the SQL reserved word CONDITION,
  // same workaround the original schema used for the column name.
  condition_: {
    type: DataTypes.ENUM('working', 'broken', 'unknown'),
    allowNull: false,
    defaultValue: 'unknown',
    field: 'condition_',
  },
  notes: DataTypes.TEXT,
}, {
  tableName: 'request_devices',
  timestamps: false,
  indexes: [
    { fields: ['request_id'] },
    { fields: ['category_id'] },
  ],
});

module.exports = RequestDevice;
