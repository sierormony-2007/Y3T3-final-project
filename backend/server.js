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

const app = express();
const PORT = process.env.PORT || 3001;

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (development)
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
  const User       = require('./models/User');
  const Pickup     = require('./models/Pickup');
  const Redemption = require('./models/Redemption');
  const Recycling  = require('./models/Recycling');

  const users       = await User.findAll();
  const pickups     = await Pickup.findAll();
  const redemptions = await Redemption.findAll();
  const records     = await Recycling.findAll();

  const userRows = users.map(u => `
    <tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.points}</td>
    <td>${u.password}</td></tr>`).join('') ||
    '<tr><td colspan="6">No users yet</td></tr>';

  const pickupRows = pickups.map(p => `
    <tr><td>${p.id}</td><td>${p.userName}</td><td>${p.category}</td><td>${p.weight} kg</td>
    <td>${p.date||'-'}</td><td>${p.status}</td><td>${p.street||''}, ${p.city||''}</td></tr>`).join('') ||
    '<tr><td colspan="7">No pickups yet</td></tr>';

  const redemptionRows = redemptions.map(r => `
    <tr><td>${r.id}</td><td>${r.userId}</td><td>${r.rewardName}</td><td>${r.pointsSpent}</td>
    <td>${new Date(r.redeemedAt).toLocaleString()}</td></tr>`).join('') ||
    '<tr><td colspan="5">No redemptions yet</td></tr>';

  const recordRows = records.map(r => `
    <tr><td>${r.id}</td><td>${r.userId}</td><td>${r.category}</td><td>${r.weight} kg</td>
    <td>${r.pointsAwarded}</td><td>${new Date(r.completedAt).toLocaleString()}</td></tr>`).join('') ||
    '<tr><td colspan="6">No records yet</td></tr>';

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
  <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Points</th><th>Password (hashed)</th></tr></thead>
  <tbody>${userRows}</tbody></table>

  <h2>Pickups (${pickups.length})</h2>
  <table><thead><tr><th>ID</th><th>User</th><th>Category</th><th>Weight</th><th>Date</th><th>Status</th><th>Address</th></tr></thead>
  <tbody>${pickupRows}</tbody></table>

  <h2>Redemptions (${redemptions.length})</h2>
  <table><thead><tr><th>ID</th><th>User ID</th><th>Reward</th><th>Points Spent</th><th>When</th></tr></thead>
  <tbody>${redemptionRows}</tbody></table>

  <h2>Recycling Records (${records.length})</h2>
  <table><thead><tr><th>ID</th><th>User ID</th><th>Category</th><th>Weight</th><th>Points</th><th>Completed At</th></tr></thead>
  <tbody>${recordRows}</tbody></table>
  </body></html>`);
});

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

// app.listen(PORT, () => {
//   console.log('');
//   console.log('========================================================');
//   console.log(` EcoRecycle BACKEND  →  http://localhost:${PORT}`);
//   // console.log(` Swagger API Docs   →  http://localhost:${PORT}/api-docs`);
//   // console.log(` Data Viewer        →  http://localhost:${PORT}/users`);
//   console.log('========================================================');
//   console.log('   Default accounts:');
//   console.log('   staff  →  admin@staff.com  / 123');
//   console.log('   user   →  kim@example.com  / 123');
//   console.log('');
// });


sequelize.sync({ force: false }).then(async () => {
  // seed default data if tables are empty
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  const Reward = require('./models/Reward');
  const Article = require('./models/Article');

  const count = await User.count();
  if (count === 0) {
    await User.bulkCreate([
      { name: 'Admin', email: 'admin@staff.com', password: bcrypt.hashSync('123', 8), role: 'staff', points: 0 },
      { name: 'kim',   email: 'kim@example.com', password: bcrypt.hashSync('123', 8), role: 'user',  points: 0 },
    ]);
    console.log('Seeded default users');
  }

  const rCount = await Reward.count();
  if (rCount === 0) {
    await Reward.bulkCreate([
      { name: 'Bamboo Water Bottle', desc: 'BPA-free', pts: 200, cat: 'Lifestyle', emoji: '🧴', stock: 50 },
      { name: 'Organic Cotton Tote Bag', desc: 'GOTS-certified', pts: 120, cat: 'Bags', emoji: '👜', stock: 100 },
      // add the rest of your rewards here
    ]);
  }

  app.listen(PORT, () => {
    console.log(`EcoRecycle BACKEND → http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
