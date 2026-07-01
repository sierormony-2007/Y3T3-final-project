const sequelize = require('../config/db');

const User = require('./User');
const DeviceCategory = require('./DeviceCategory');
const Staff = require('./Staff');
const PickupRequest = require('./PickupRequest');
const RequestDevice = require('./RequestDevice');
const RewardTransaction = require('./RewardTransaction');
const Notification = require('./Notification');
const UserImpact = require('./UserImpact');

// ----------------------------------------------------------------
// ASSOCIATIONS — mirror the FOREIGN KEY ... ON DELETE / ON UPDATE
// clauses from the SQL schema exactly.
// ----------------------------------------------------------------

// users 1—M pickup_requests (ON DELETE CASCADE)
User.hasMany(PickupRequest, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PickupRequest.belongsTo(User, { foreignKey: 'user_id' });

// staff 1—M pickup_requests (ON DELETE SET NULL)
Staff.hasMany(PickupRequest, { foreignKey: 'staff_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
PickupRequest.belongsTo(Staff, { foreignKey: 'staff_id' });

// pickup_requests 1—M request_devices (ON DELETE CASCADE)
PickupRequest.hasMany(RequestDevice, { foreignKey: 'request_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RequestDevice.belongsTo(PickupRequest, { foreignKey: 'request_id' });

// device_categories 1—M request_devices (ON DELETE RESTRICT — can't delete a
// category that's still referenced by a device row)
DeviceCategory.hasMany(RequestDevice, { foreignKey: 'category_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
RequestDevice.belongsTo(DeviceCategory, { foreignKey: 'category_id' });

// users 1—M reward_transactions (ON DELETE CASCADE)
User.hasMany(RewardTransaction, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RewardTransaction.belongsTo(User, { foreignKey: 'user_id' });

// pickup_requests 1—M reward_transactions (ON DELETE SET NULL, nullable FK)
PickupRequest.hasMany(RewardTransaction, { foreignKey: 'request_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
RewardTransaction.belongsTo(PickupRequest, { foreignKey: 'request_id' });

// users 1—M notifications (ON DELETE CASCADE)
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// users 1—1 user_impact (ON DELETE CASCADE)
User.hasOne(UserImpact, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
UserImpact.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  DeviceCategory,
  Staff,
  PickupRequest,
  RequestDevice,
  RewardTransaction,
  Notification,
  UserImpact,
};