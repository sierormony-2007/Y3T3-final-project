// models/User.js
// Accessor helpers for the users collection in lowdb
const db = require('../config/db');

const User = {
  findAll: () => db.get('users').value(),
  findById: (id) => db.get('users').find({ id }).value(),
  findByEmail: (email) => db.get('users').find({ email }).value(),
  create: (data) => {
    db.get('users').push(data).write();
    return data;
  },
  update: (id, data) => {
    db.get('users').find({ id }).assign(data).write();
    return db.get('users').find({ id }).value();
  },
};

module.exports = User;
