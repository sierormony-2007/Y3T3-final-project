const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PickupRequest = sequelize.define('PickupRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  staff_id: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_transit', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  pickup_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pickup_latitude: DataTypes.DECIMAL(10, 7),
  pickup_longitude: DataTypes.DECIMAL(10, 7),
  preferred_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time_window_start: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  time_window_end: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  special_note: DataTypes.TEXT,
  total_devices: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  total_weight_kg: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  points_awarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  completed_at: DataTypes.DATE,
}, {
  tableName: 'pickup_requests',
  timestamps: true,
  createdAt: 'requested_at',
  updatedAt: false, // schema has no updated_at column on this table
  validate: {
    // mirrors: CONSTRAINT chk_time_window CHECK (time_window_end > time_window_start)
    timeWindowValid() {
      if (this.time_window_end <= this.time_window_start) {
        throw new Error('time_window_end must be after time_window_start');
      }
    },
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['staff_id'] },
    { fields: ['status'] },
    { fields: ['preferred_date'] },
  ],
});

module.exports = PickupRequest;