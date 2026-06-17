const db = require('../config/db');

function getArticles() { return db.get('articles').value(); }

function getArticleById(id) {
  const article = db.get('articles').find({ id: parseInt(id) }).value();
  if (!article) throw { status: 404, message: 'Article not found' };
  return article;
}

function createArticle({ title, content, category }, authorId) {
  if (!title || !content) throw { status: 400, message: 'Title and content are required' };
  const articles = db.get('articles').value();
  const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
  const user = db.get('users').find({ id: authorId }).value();
  const newArticle = { id: newId, title, content, category: category || 'General', author: user ? user.name : 'Staff', createdAt: new Date().toISOString().split('T')[0] };
  db.get('articles').push(newArticle).write();
  return newArticle;
}

function updateArticle(id, body) {
  const article = db.get('articles').find({ id: parseInt(id) }).value();
  if (!article) throw { status: 404, message: 'Article not found' };
  const update = {};
  ['title','content','category'].forEach(k => { if (body[k] !== undefined) update[k] = body[k]; });
  db.get('articles').find({ id: parseInt(id) }).assign(update).write();
  return db.get('articles').find({ id: parseInt(id) }).value();
}

function deleteArticle(id) {
  const article = db.get('articles').find({ id: parseInt(id) }).value();
  if (!article) throw { status: 404, message: 'Article not found' };
  db.get('articles').remove({ id: parseInt(id) }).write();
  return { message: 'Article deleted' };
}

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };
