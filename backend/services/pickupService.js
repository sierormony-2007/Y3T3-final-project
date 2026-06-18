const db = require('../config/db');
const { calculatePoints } = require('../utils/calculatePoints');

function createPickup(userId, body) {
  const { category, description, itemCount, weight, date, timeSlot, street, city, postal, notes } = body;
  if (!category || !weight || !date || !street)
    throw { status: 400, message: 'Category, weight, date, and street are required' };

  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) throw { status: 400, message: 'Weight must be a positive number' };
  if (weightNum < 5) throw { status: 400, message: 'Minimum weight requirement is 5 kg' };

  const pickups = db.get('pickups').value();
  const newId = pickups.length > 0 ? Math.max(...pickups.map(p => p.id)) + 1 : 1;
  const user = db.get('users').find({ id: userId }).value();

  const newPickup = {
    id: newId, userId, userName: user.name, category,
    description: description || '', itemCount: itemCount || 1,
    weight: weightNum, date, timeSlot: timeSlot || '',
    street, city: city || '', postal: postal || '', notes: notes || '',
    status: 'pending', createdAt: new Date().toISOString(),
  };

  db.get('pickups').push(newPickup).write();
  console.log(`🚚 PICKUP: "${user.name}" ${category} ${weightNum}kg id=${newId}`);
  return newPickup;
}

function getPickups(userId, role) {
  if (role === 'staff') return db.get('pickups').value();
  return db.get('pickups').filter({ userId }).value();
}

function getPickupById(id, userId, role) {
  const pickup = db.get('pickups').find({ id: parseInt(id) }).value();
  if (!pickup) throw { status: 404, message: 'Pickup not found' };
  if (role !== 'staff' && pickup.userId !== userId) throw { status: 403, message: 'Forbidden' };
  return pickup;
}

function updateStatus(id, status, actorRole) {
  const VALID = [
    'pending',
    'accepted',
    'picked_up',
    'processing',
    'recycled'
  ];

  if (!VALID.includes(status)) {
    throw {
      status: 400,
      message: `Status must be one of: ${VALID.join(', ')}`
    };
  }

  const pickup = db.get('pickups')
    .find({ id: parseInt(id) })
    .value();

  if (!pickup) {
    throw {
      status: 404,
      message: 'Pickup not found'
    };
  }

  // Save old status before update
  const oldStatus = pickup.status;

  // Update pickup status
  db.get('pickups')
    .find({ id: parseInt(id) })
    .assign({ status })
    .write();

  console.log(`🔄 STATUS: pickup #${id} → "${status}"`);

  // Award points only once when pickup is picked up
  if (status === 'picked_up' && oldStatus !== 'picked_up') {

    const pts = calculatePoints(
      pickup.weight,
      pickup.category
    );

    const user = db.get('users')
      .find({ id: pickup.userId })
      .value();

    if (user) {

      // Update user points
      db.get('users')
        .find({ id: pickup.userId })
        .assign({
          points: (user.points || 0) + pts
        })
        .write();

      // Avoid duplicate recycling records
      const existingRecord = db.get('recyclingRecords')
        .find({ pickupId: pickup.id })
        .value();

      if (!existingRecord) {

        const records = db.get('recyclingRecords').value();

        const recId = records.length > 0
          ? Math.max(...records.map(r => r.id)) + 1
          : 1;

        db.get('recyclingRecords')
          .push({
            id: recId,
            pickupId: pickup.id,
            userId: pickup.userId,
            category: pickup.category,
            weight: pickup.weight,
            pointsAwarded: pts,
            completedAt: new Date().toISOString()
          })
          .write();

        console.log(
          `✅ Awarded ${pts} points to user ${pickup.userId}`
        );
      }
    }
  }

  return db.get('pickups')
    .find({ id: parseInt(id) })
    .value();
}

function cancelPickup(id, userId, role) {
  const pickup = db.get('pickups').find({ id: parseInt(id) }).value();
  if (!pickup) throw { status: 404, message: 'Pickup not found' };
  if (role !== 'staff' && pickup.userId !== userId) throw { status: 403, message: 'Forbidden' };
  if (pickup.status !== 'pending') throw { status: 400, message: 'Only pending pickups can be cancelled' };
  db.get('pickups').remove({ id: parseInt(id) }).write();
  return { message: 'Pickup cancelled successfully' };
}

function getHistory(userId) {
  return db.get('pickups').filter(p => p.userId === userId && p.status === 'recycled').value();
}

module.exports = { createPickup, getPickups, getPickupById, updateStatus, cancelPickup, getHistory };