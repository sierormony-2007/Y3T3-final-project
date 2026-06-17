const svc = require('../services/articleService');

function getArticles(req, res, next) {
  try { res.json(svc.getArticles()); } catch (err) { next(err); }
}
function getArticleById(req, res, next) {
  try { res.json(svc.getArticleById(req.params.id)); } catch (err) { next(err); }
}
function createArticle(req, res, next) {
  try { res.status(201).json(svc.createArticle(req.body, req.user.id)); } catch (err) { next(err); }
}
function updateArticle(req, res, next) {
  try { res.json(svc.updateArticle(req.params.id, req.body)); } catch (err) { next(err); }
}
function deleteArticle(req, res, next) {
  try { res.json(svc.deleteArticle(req.params.id)); } catch (err) { next(err); }
}

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };
