const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Staff = sequelize.define('Staff', {
  staff_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('collector', 'manager', 'admin'),
    allowNull: false,
    defaultValue: 'collector',
  },
  phone: DataTypes.STRING(20),
  zone: DataTypes.STRING(100),
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.00,
    validate: { min: 0, max: 5 },
  },
}, {
  tableName: 'staff',
  timestamps: false,
  indexes: [
    { fields: ['zone'] },
    { fields: ['is_available'] },
  ],
});

module.exports = Staff;
