require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const authRoutes    = require('./routes/authRoutes');
const pickupRoutes  = require('./routes/pickupRoutes');
const rewardRoutes  = require('./routes/rewardRoutes');
const impactRoutes  = require('./routes/impactRoutes');
const articleRoutes = require('./routes/articleRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const categoryRoutes = require('./routes/deviceCategoryRoutes');
const app = express();
const PORT = process.env.PORT || 3001;

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/api/categories', categoryRoutes);

//Request logger (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}





// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/pickups',  pickupRoutes);
app.use('/api/rewards',  rewardRoutes);
app.use('/api/impact',   impactRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV })
);

// Data viewer (dev/debug only)
app.get('/users', async (_req, res) => {
  const { User, PickupRequest, RewardTransaction } = require('./models');

  const users            = await User.findAll();
  const pickups          = await PickupRequest.findAll();
  const rewardTransactions = await RewardTransaction.findAll();

  const userRows = users.map(u => `
    <tr><td>${u.user_id}</td><td>${u.full_name}</td><td>${u.email}</td><td>${u.total_points}</td>
    <td>${u.account_status}</td></tr>`).join('') ||
    '<tr><td colspan="5">No users yet</td></tr>';

  const pickupRows = pickups.map(p => `
    <tr><td>${p.request_id}</td><td>${p.user_id}</td><td>${p.total_devices}</td><td>${p.total_weight_kg} kg</td>
    <td>${p.preferred_date}</td><td>${p.status}</td><td>${p.pickup_address}</td></tr>`).join('') ||
    '<tr><td colspan="7">No pickups yet</td></tr>';

  const transactionRows = rewardTransactions.map(r => `
    <tr><td>${r.transaction_id}</td><td>${r.user_id}</td><td>${r.type}</td><td>${r.points}</td>
    <td>${r.description || ''}</td></tr>`).join('') ||
    '<tr><td colspan="5">No reward transactions yet</td></tr>';

  res.send(`<!DOCTYPE html><html><head><title>EcoRecycle Data Viewer</title>
  <meta http-equiv="refresh" content="10">
  <style>
    body { font-family: sans-serif; background: #fff; color: #000; padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 4px; }
    h2 { margin-top: 32px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px 12px; text-align: left; border: 1px solid #ccc; font-size: 13px; }
    th { background: #f5f5f5; font-weight: bold; }
  </style></head><body>
  <h1>EcoRecycle Data Viewer</h1>
  <p>Auto-refreshes every 10 seconds</p>

  <h2>Users (${users.length})</h2>
  <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Points</th><th>Status</th></tr></thead>
  <tbody>${userRows}</tbody></table>

  <h2>Pickups (${pickups.length})</h2>
  <table><thead><tr><th>ID</th><th>User ID</th><th>Devices</th><th>Weight</th><th>Date</th><th>Status</th><th>Address</th></tr></thead>
  <tbody>${pickupRows}</tbody></table>

  <h2>Reward Transactions (${rewardTransactions.length})</h2>
  <table><thead><tr><th>ID</th><th>User ID</th><th>Type</th><th>Points</th><th>Description</th></tr></thead>
  <tbody>${transactionRows}</tbody></table>
  </body></html>`);
});

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);



sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('========================================================');
    console.log(` EcoRecycle BACKEND  →  http://localhost:${PORT}`);
    console.log(` Data Viewer         →  http://localhost:${PORT}/users`);
    console.log('========================================================');
    console.log(' No data yet? Run: npm run seed');
    console.log('');
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
