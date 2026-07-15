require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
<<<<<<< HEAD
  process.env.DB_NAME || 'EWASTE_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
=======
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
>>>>>>> e2f9ee795164409a993eee607fea95d6869fd422
        rejectUnauthorized: false,
      },
    },
  }
);

module.exports = sequelize;