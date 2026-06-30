const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  message: DataTypes.TEXT,
  type: {
    type: DataTypes.ENUM('pickup', 'reward', 'reminder', 'system'),
    allowNull: false,
    defaultValue: 'system',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'sent_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['user_id', 'is_read'] },
  ],
});

module.exports = Notification;
