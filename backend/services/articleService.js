const { Article, Staff } = require('../models');

async function getArticles() {
  return Article.findAll({
    where: { is_published: true },
    include: [{ model: Staff, attributes: ['full_name'], required: false }],
    order: [['created_at', 'DESC']],
  });
}

async function getArticleById(id) {
  const article = await Article.findByPk(id, {
    include: [{ model: Staff, attributes: ['full_name'], required: false }],
  });
  if (!article) throw { status: 404, message: 'Article not found' };
  return article;
}

async function createArticle(body, staffId) {
  const { title, content } = body;
  if (!title || !content) {
    throw { status: 400, message: 'title and content are required' };
  }
  return Article.create({ ...body, staff_id: staffId });
}

async function updateArticle(id, updates) {
  const article = await Article.findByPk(id);
  if (!article) throw { status: 404, message: 'Article not found' };

  const allowed = ['title', 'summary', 'content', 'cover_image_url', 'is_published'];
  Object.keys(updates)
    .filter((key) => allowed.includes(key))
    .forEach((key) => { article[key] = updates[key]; });

  await article.save();
  return article;
}

async function deleteArticle(id) {
  const article = await Article.findByPk(id);
  if (!article) throw { status: 404, message: 'Article not found' };
  await article.destroy();
  return { message: 'Article deleted' };
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
