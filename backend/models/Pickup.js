const db = require('../config/db');

const Pickup = {
  findAll: () => db.get('pickups').value(),
  findById: (id) => db.get('pickups').find({ id }).value(),
  findByUser: (userId) => db.get('pickups').filter({ userId }).value(),
  create: (data) => { db.get('pickups').push(data).write(); return data; },
  update: (id, data) => {
    db.get('pickups').find({ id }).assign(data).write();
    return db.get('pickups').find({ id }).value();
  },
  remove: (id) => { db.get('pickups').remove({ id }).write(); },
};

module.exports = Pickup;
