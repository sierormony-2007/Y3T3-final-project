const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RewardTransaction = sequelize.define('RewardTransaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  request_id: DataTypes.INTEGER,
  type: {
    type: DataTypes.ENUM('earned', 'redeemed'),
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: DataTypes.STRING(200),
}, {
  tableName: 'reward_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  validate: {
    // mirrors: CHECK ((type='earned' AND points>0) OR (type='redeemed' AND points<0))
    pointsSignMatchesType() {
      if (this.type === 'earned' && this.points <= 0) {
        throw new Error('earned transactions must have points > 0');
      }
      if (this.type === 'redeemed' && this.points >= 0) {
        throw new Error('redeemed transactions must have points < 0');
      }
    },
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['request_id'] },
  ],
  hooks: {
    // Replaces trg_after_reward_insert.
    // Runs in the same transaction as the insert (if one is passed in options),
    // so it stays consistent the same way the trigger did.
    afterCreate: async (transaction, options) => {
      const User = require('./User');
      await User.increment(
        { total_points: transaction.points },
        { where: { user_id: transaction.user_id }, transaction: options.transaction }
      );
    },
  },
});

module.exports = RewardTransaction;