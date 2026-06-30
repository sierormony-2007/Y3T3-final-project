const svc = require('../services/articleService');

async function getArticles(req, res, next) {
  try { res.json(await svc.getArticles()); } catch (err) { next(err); }
}
async function getArticleById(req, res, next) {
  try { res.json(await svc.getArticleById(req.params.id)); } catch (err) { next(err); }
}
async function createArticle(req, res, next) {
  try { res.status(201).json(await svc.createArticle(req.body, req.user.id)); } catch (err) { next(err); }
}
async function updateArticle(req, res, next) {
  try { res.json(await svc.updateArticle(req.params.id, req.body)); } catch (err) { next(err); }
}
async function deleteArticle(req, res, next) {
  try { res.json(await svc.deleteArticle(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };