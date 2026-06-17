const db = require('../config/db');

const Reward = {
  findAll: () => db.get('rewards').value(),
  findById: (id) => db.get('rewards').find({ id }).value(),
  create: (data) => { db.get('rewards').push(data).write(); return data; },
  update: (id, data) => {
    db.get('rewards').find({ id }).assign(data).write();
    return db.get('rewards').find({ id }).value();
  },
  remove: (id) => { db.get('rewards').remove({ id }).write(); },
};

module.exports = Reward;
