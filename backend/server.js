require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes    = require('./routes/authRoutes');
const pickupRoutes  = require('./routes/pickupRoutes');
const rewardRoutes  = require('./routes/rewardRoutes');
const impactRoutes  = require('./routes/impactRoutes');
const articleRoutes = require('./routes/articleRoutes');
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

// ── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'EcoRecycle API Docs',
  swaggerOptions: { persistAuthorization: true },
  customCss: `
    body, .swagger-ui { background: #ffffff !important; color: #000000 !important; }
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info a { color: #000000 !important; }
    .swagger-ui .scheme-container { background: #ffffff !important; box-shadow: none !important; border-bottom: 1px solid #ddd !important; }
    .swagger-ui .opblock-tag { color: #000000 !important; border-bottom: 1px solid #ddd !important; }
    .swagger-ui .opblock-tag small { color: #444444 !important; }
    .swagger-ui .opblock { border: 1px solid #ddd !important; box-shadow: none !important; background: #fafafa !important; }
    .swagger-ui .opblock .opblock-summary { background: #f5f5f5 !important; }
    .swagger-ui .opblock .opblock-summary-description { color: #000000 !important; }
    .swagger-ui .opblock .opblock-summary-path { color: #000000 !important; }
    .swagger-ui .opblock-body { background: #ffffff !important; }
    .swagger-ui section.models { background: #ffffff !important; border: 1px solid #ddd !important; }
    .swagger-ui section.models h4 { color: #000000 !important; }
    .swagger-ui .model-title, .swagger-ui .model { color: #000000 !important; }
    .swagger-ui table thead tr th, .swagger-ui table thead tr td { color: #000000 !important; border-bottom: 1px solid #ddd !important; }
    .swagger-ui .parameter__name, .swagger-ui .parameter__type { color: #000000 !important; }
    .swagger-ui .response-col_status { color: #000000 !important; }
    .swagger-ui .response-col_description { color: #000000 !important; }
    .swagger-ui select, .swagger-ui input[type=text], .swagger-ui textarea { background: #ffffff !important; color: #000000 !important; border: 1px solid #ccc !important; }
    .swagger-ui .btn { color: #000000 !important; border-color: #ccc !important; background: #f5f5f5 !important; }
    .swagger-ui .btn.execute { background: #000000 !important; color: #ffffff !important; border-color: #000000 !important; }
    .swagger-ui .btn.authorize { background: #ffffff !important; color: #000000 !important; border-color: #000000 !important; }
    .swagger-ui .dialog-ux .modal-ux { background: #ffffff !important; color: #000000 !important; }
    .swagger-ui .dialog-ux .modal-ux-header { background: #ffffff !important; border-bottom: 1px solid #ddd !important; }
    .swagger-ui .dialog-ux .modal-ux-header h3 { color: #000000 !important; }
    .swagger-ui .highlight-code { background: #f5f5f5 !important; }
    .swagger-ui .microlight { background: #f5f5f5 !important; color: #000000 !important; }
    .swagger-ui .servers > label, .swagger-ui .servers > label select { color: #000000 !important; background: #ffffff !important; }
  `,
}));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/pickups',  pickupRoutes);
app.use('/api/rewards',  rewardRoutes);
app.use('/api/impact',   impactRoutes);
app.use('/api/articles', articleRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV })
);

// Data viewer (dev/debug only)
app.get('/users', (_req, res) => {
  const db = require('./config/db');
  const users       = db.get('users').value();
  const pickups     = db.get('pickups').value();
  const redemptions = db.get('redemptions').value();
  const records     = db.get('recyclingRecords').value();

  const userRows = users.map(u => `
    <tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.points}</td>
    <td style="font-family:monospace;font-size:11px;color:#888">${u.password}</td></tr>`).join('') ||
    '<tr><td colspan="6" class="empty">No users yet</td></tr>';

  const pickupRows = pickups.map(p => `
    <tr><td>${p.id}</td><td>${p.userName}</td><td>${p.category}</td><td>${p.weight} kg</td>
    <td>${p.date||'-'}</td><td><span class="badge">${p.status}</span></td><td>${p.street||''}, ${p.city||''}</td></tr>`).join('') ||
    '<tr><td colspan="7" class="empty">No pickups yet</td></tr>';

  const redemptionRows = redemptions.map(r => `
    <tr><td>${r.id}</td><td>${r.userId}</td><td>${r.rewardName}</td><td>${r.pointsSpent}</td>
    <td>${new Date(r.redeemedAt).toLocaleString()}</td></tr>`).join('') ||
    '<tr><td colspan="5" class="empty">No redemptions yet</td></tr>';

  const recordRows = records.map(r => `
    <tr><td>${r.id}</td><td>${r.userId}</td><td>${r.category}</td><td>${r.weight} kg</td>
    <td>${r.pointsAwarded}</td><td>${new Date(r.completedAt).toLocaleString()}</td></tr>`).join('') ||
    '<tr><td colspan="6" class="empty">No records yet</td></tr>';

  res.send(`<!DOCTYPE html><html><head><title>EcoRecycle Data Viewer</title>
  <meta http-equiv="refresh" content="10">
  <style>
    body{font-family:sans-serif;background:#0d1117;color:#e6edf3;padding:24px;max-width:1200px;margin:0 auto}
    h1{color:#3fb950} h2{color:#58a6ff;margin-top:36px;border-bottom:1px solid #30363d;padding-bottom:8px}
    .sub{color:#8b949e;font-size:13px} .links a{color:#58a6ff;margin-right:16px;text-decoration:none}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:9px 12px;text-align:left;border-bottom:1px solid #30363d;font-size:13px}
    th{background:#161b22;color:#8b949e;font-size:12px} tr:hover{background:#161b22}
    .empty{text-align:center;color:#6e7681;padding:18px}
    .badge{background:#1f6feb33;color:#58a6ff;padding:2px 8px;border-radius:10px;font-size:11px}
  </style></head><body>
  <h1>EcoRecycle Backend Data Viewer</h1>
  <div class="sub">Live data from db.json — auto-refreshes every 10s</div>
  <div class="links" style="margin-top:12px">
    <a href="/api-docs">Swagger API Docs</a>
    <a href="/api/health"> Health Check</a>
    <a href="/api/articles"> Articles (public)</a>
  </div>
  <h2> Users (${users.length})</h2>
  <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Points</th><th>Password (hashed)</th></tr></thead>
  <tbody>${userRows}</tbody></table>
  <h2> Pickup Requests (${pickups.length})</h2>
  <table><thead><tr><th>ID</th><th>User</th><th>Category</th><th>Weight</th><th>Date</th><th>Status</th><th>Address</th></tr></thead>
  <tbody>${pickupRows}</tbody></table>
  <h2> Reward Redemptions (${redemptions.length})</h2>
  <table><thead><tr><th>ID</th><th>User ID</th><th>Reward</th><th>Points Spent</th><th>When</th></tr></thead>
  <tbody>${redemptionRows}</tbody></table>
  <h2> Completed Recycling Records (${records.length})</h2>
  <table><thead><tr><th>ID</th><th>User ID</th><th>Category</th><th>Weight</th><th>Points Awarded</th><th>Completed At</th></tr></thead>
  <tbody>${recordRows}</tbody></table>
  </body></html>`);
});

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('');
  console.log('========================================================');
  console.log(` EcoRecycle BACKEND  →  http://localhost:${PORT}`);
  // console.log(` Swagger API Docs   →  http://localhost:${PORT}/api-docs`);
  // console.log(` Data Viewer        →  http://localhost:${PORT}/users`);
  console.log('========================================================');
  console.log('   Default accounts:');
  console.log('   staff  →  admin@staff.com  / 123');
  console.log('   user   →  kim@example.com  / 123');
  console.log('');
});
