const db = require('../config/db');

const Article = {
  findAll: () => db.get('articles').value(),
  findById: (id) => db.get('articles').find({ id }).value(),
  create: (data) => { db.get('articles').push(data).write(); return data; },
  update: (id, data) => {
    db.get('articles').find({ id }).assign(data).write();
    return db.get('articles').find({ id }).value();
  },
  remove: (id) => { db.get('articles').remove({ id }).write(); },
};

module.exports = Article;
