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
  pickup_latitude:  DataTypes.DECIMAL(10, 7),
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
  // ── NEW fields ──────────────────────────────────────────────
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: null,
    comment: 'Contact phone number for this pickup',
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
    comment: 'Google Maps or any reference link for the pickup location',
  },
  image_url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    defaultValue: null,
    comment: 'Image URL of the device(s)',
  },
  // ────────────────────────────────────────────────────────────
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
  updatedAt: false,
  validate: {
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
