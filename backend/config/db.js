require("dotenv").config();
const { Sequelize } = require("sequelize");

const isCloud = !!(process.env.DB_HOST && process.env.DB_HOST !== 'localhost');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'EWASTE_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    // Connection pool — reuse connections instead of opening a new one per request
    pool: {
      max: 10,        // max simultaneous connections
      min: 0,         // 0 = don't open connections eagerly; connect on first query only
      acquire: 30000, // ms to wait before throwing an error if a connection can't be obtained
      idle: 10000,    // ms a connection can sit idle before being released
    },
    dialectOptions: isCloud
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          // Keep-alive pings so the cloud DB doesn't drop idle connections
          connectTimeout: 20000,
        }
      : {},
  }
);

module.exports = sequelize;