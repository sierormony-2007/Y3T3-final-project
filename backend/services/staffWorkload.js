const { Op } = require('sequelize');
const {
  sequelize,
  PickupRequest,
  RequestDevice,
  DeviceCategory,
  Staff,
  User,
  UserImpact,
  RewardTransaction,
} = require('../models');

function isStaff(role) {
  return role && role !== 'user';
}

async function createPickup(userId, body) {
  const {
    pickup_address,
    pickup_latitude,
    pickup_longitude,
    preferred_date,
    time_window_start,
    time_window_end,
    special_note,
    phone,
    link,
    devices,
  } = body;

  if (!pickup_address || !preferred_date || !time_window_start || !time_window_end) {
    throw { status: 400, message: 'pickup_address, preferred_date, time_window_start and time_window_end are required' };
  }
  if (!phone) {
    throw { status: 400, message: 'A contact phone number is required' };
  }
  if (!Array.isArray(devices) || devices.length === 0) {
    throw { status: 400, message: 'At least one device is required' };
  }

  return sequelize.transaction(async (t) => {
    const categories = await DeviceCategory.findAll({
      where: { category_id: { [Op.in]: devices.map((d) => d.category_id) } },
      transaction: t,
    });
    const categoryMap = new Map(categories.map((c) => [c.category_id, c]));

    let total_devices = 0;
    let total_weight_kg = 0;
    let points_awarded = 0;

    for (const d of devices) {
      const category = categoryMap.get(d.category_id);
      if (!category) {
        throw { status: 400, message: `Unknown category_id: ${d.category_id}` };
      }
      const quantity = d.quantity || 1;
      const weight = Number(d.weight_kg) || 0;
      total_devices += quantity;
      total_weight_kg += weight;
      points_awarded += weight * Number(category.points_per_kg);
    }

    const pickup = await PickupRequest.create({
      user_id: userId,
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      preferred_date,
      time_window_start,
      time_window_end,
      special_note,
      phone:  phone  || null,
      link:   link   || null,
      total_devices,
      total_weight_kg,
      points_awarded: Math.round(points_awarded),
    }, { transaction: t });

    await RequestDevice.bulkCreate(
      devices.map((d) => ({
        request_id:  pickup.request_id,
        category_id: d.category_id,
        quantity:    d.quantity || 1,
        weight_kg:   d.weight_kg || 0,
        condition_:  d.condition_ || 'unknown',
        notes:       d.notes,
      })),
      { transaction: t }
    );

    return pickup;
  });
}

async function getPickups(userId, role) {
  const where = isStaff(role) ? {} : { user_id: userId };
  return PickupRequest.findAll({
    where,
    include: [
      { model: User,          attributes: ['full_name', 'phone', 'city'] },
      { model: Staff,         attributes: ['full_name'], required: false },
      { model: RequestDevice, include: [{ model: DeviceCategory }] },
    ],
    order: [['requested_at', 'DESC']],
  });
}

async function getPickupById(id, userId, role) {
  const pickup = await PickupRequest.findByPk(id, {
    include: [
      { model: User,          attributes: ['full_name', 'phone', 'city'] },
      { model: Staff,         attributes: ['full_name'], required: false },
      { model: RequestDevice, include: [{ model: DeviceCategory }] },
    ],
  });
  if (!pickup) throw { status: 404, message: 'Pickup request not found' };
  if (!isStaff(role) && pickup.user_id !== userId) {
    throw { status: 403, message: 'Forbidden: not your pickup request' };
  }
  return pickup;
}

async function updateStatus(id, status, role, staffRole) {
  const validStatuses = ['pending', 'confirmed', 'in_transit', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw { status: 400, message: `status must be one of: ${validStatuses.join(', ')}` };
  }
  if (!isStaff(role)) {
    throw { status: 403, message: 'Forbidden: staff only' };
  }
  const isAdmin = staffRole === 'admin';

  return sequelize.transaction(async (t) => {
    const pickup = await PickupRequest.findByPk(id, { transaction: t });
    if (!pickup) throw { status: 404, message: 'Pickup request not found' };

    // Operator staff can only Accept a pending request (pending -> confirmed).
    // Marking it picked up, completing it, or cancelling it is admin-only.
    if (!isAdmin) {
      const isAcceptAction = pickup.status === 'pending' && status === 'confirmed';
      if (!isAcceptAction) {
        throw { status: 403, message: 'Forbidden: operator staff can only accept pending requests' };
      }
    }

    const wasConfirmedOrBeyond = pickup.status !== 'pending';
    pickup.status = status;

    if (status === 'completed') {
      pickup.completed_at = new Date();
    }

    // Credit points + impact stats the moment staff confirms the pickup —
    // this is the "Accept" action, the first status change away from pending.
    if (status === 'confirmed' && !wasConfirmedOrBeyond) {
      if (pickup.points_awarded > 0) {
        await RewardTransaction.create({
          user_id:     pickup.user_id,
          request_id:  pickup.request_id,
          type:        'earned',
          points:      pickup.points_awarded,
          description: `Pickup #${pickup.request_id} confirmed`,
        }, { transaction: t });
      }

      const [impact] = await UserImpact.findOrCreate({
        where:    { user_id: pickup.user_id },
        defaults: { user_id: pickup.user_id },
        transaction: t,
      });
      await impact.increment({
        total_devices:      pickup.total_devices,
        total_weight_kg:    pickup.total_weight_kg,
        co2_saved_kg:       Number(pickup.total_weight_kg) * 1.5,
        toxins_diverted_kg: Number(pickup.total_weight_kg) * 0.05,
        total_pickups:      1,
      }, { transaction: t });
    }

    await pickup.save({ transaction: t });
    return pickup;
  });
}

async function cancelPickup(id, userId, role, staffRole) {
  return sequelize.transaction(async (t) => {
    const pickup = await PickupRequest.findByPk(id, { transaction: t });
    if (!pickup) throw { status: 404, message: 'Pickup request not found' };
    if (!isStaff(role) && pickup.user_id !== userId) {
      throw { status: 403, message: 'Forbidden: not your pickup request' };
    }
    // Operator staff can only Accept requests — cancelling is admin-only
    // (the requesting user can still cancel their own pickup).
    if (isStaff(role) && staffRole !== 'admin') {
      throw { status: 403, message: 'Forbidden: operator staff can only accept pending requests' };
    }
    if (['completed', 'cancelled'].includes(pickup.status)) {
      throw { status: 400, message: `Cannot cancel a pickup that is already ${pickup.status}` };
    }

    // Points/impact are credited as soon as staff confirms (see updateStatus).
    // If this pickup was already confirmed, claw that credit back on cancel.
    const wasConfirmedOrBeyond = pickup.status !== 'pending';
    if (wasConfirmedOrBeyond) {
      if (pickup.points_awarded > 0) {
        await RewardTransaction.create({
          user_id:     pickup.user_id,
          request_id:  pickup.request_id,
          type:        'redeemed',
          points:      -pickup.points_awarded,
          description: `Pickup #${pickup.request_id} cancelled — points reversed`,
        }, { transaction: t });
      }
      const impact = await UserImpact.findOne({ where: { user_id: pickup.user_id }, transaction: t });
      if (impact) {
        await impact.decrement({
          total_devices:      pickup.total_devices,
          total_weight_kg:    pickup.total_weight_kg,
          co2_saved_kg:       Number(pickup.total_weight_kg) * 1.5,
          toxins_diverted_kg: Number(pickup.total_weight_kg) * 0.05,
          total_pickups:      1,
        }, { transaction: t });
      }
    }

    pickup.status = 'cancelled';
    await pickup.save({ transaction: t });
    return pickup;
  });
}

async function getHistory(userId) {
  if (!userId) throw { status: 401, message: 'Authentication required' };
  const where = {
    user_id: userId,
    status: { [Op.in]: ['completed', 'cancelled'] },
  };
  return PickupRequest.findAll({
    where,
    include: [{ model: Staff, attributes: ['full_name'], required: false }],
    order: [['requested_at', 'DESC']],
  });
}

module.exports = {
  createPickup,
  getPickups,
  getPickupById,
  updateStatus,
  cancelPickup,
  getHistory,
};
