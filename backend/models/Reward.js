const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reward = sequelize.define('Reward', {
  reward_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  points_cost: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: { args: [1], msg: 'points_cost must be > 0' } },
  },
  category: DataTypes.STRING(50),
  emoji: DataTypes.STRING(10),
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'rewards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Reward;
