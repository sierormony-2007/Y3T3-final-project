const db = require('../config/db');

const Recycling = {
  findAll: () => db.get('recyclingRecords').value(),
  findByUser: (userId) => db.get('recyclingRecords').filter({ userId }).value(),
  create: (data) => { db.get('recyclingRecords').push(data).write(); return data; },
};

module.exports = Recycling;
