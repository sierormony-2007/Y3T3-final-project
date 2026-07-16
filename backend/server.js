require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');
const sequelize  = require('./config/db');

const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const pickupRoutes    = require('./routes/pickupRoutes');
const rewardRoutes    = require('./routes/rewardRoutes');
const impactRoutes    = require('./routes/impactRoutes');
const articleRoutes   = require('./routes/articleRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const categoryRoutes  = require('./routes/deviceCategoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Swagger setup ─────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoRecycle API',
      version: '2.0.0',
      description: 'E-Waste Collection & Rewards Management System — full REST API',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local dev server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT token from /api/auth/login here',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user:  { type: 'object' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['full_name', 'email', 'password'],
          properties: {
            full_name: { type: 'string',  example: 'Srey Leak' },
            email:     { type: 'string',  format: 'email', example: 'sreyleak@gmail.com' },
            password:  { type: 'string',  example: 'mypassword123' },
            phone:     { type: 'string',  example: '012345678' },
            address:   { type: 'string',  example: 'House 12, St. 105, Daun Penh' },
            city:      { type: 'string',  example: 'Phnom Penh' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'admin@staff.com' },
            password: { type: 'string', example: '123' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
});

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'EcoRecycle API Docs',
  swaggerOptions: { persistAuthorization: true },
}));



// app.use(cors({
//   origin: 'https://y3-t3-final-project.vercel.app',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/pickups',   pickupRoutes);
app.use('/api/rewards',   rewardRoutes);
app.use('/api/impact',    impactRoutes);
app.use('/api/articles',  articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV })
);

// ── Data Viewer (dev/debug) ───────────────────────────────────────────────────
app.get('/users', async (_req, res) => {
  const { User, PickupRequest, RewardTransaction } = require('./models');

  const users              = await User.findAll();
  const pickups            = await PickupRequest.findAll();
  const rewardTransactions = await RewardTransaction.findAll();

  const userRows = users.map(u => `
    <tr>
      <td>${u.user_id}</td>
      <td>${u.full_name}</td>
      <td>${u.email}</td>
      <td>${u.phone || '-'}</td>
      <td>${u.account_status}</td>
      <td>${u.total_points}</td>
      <td style="font-size:11px;font-family:monospace;word-break:break-all;">${u.password_hash}</td>
    </tr>`).join('') || '<tr><td colspan="7">No users yet</td></tr>';

  const pickupRows = pickups.map(p => `
    <tr>
      <td>${p.request_id}</td>
      <td>${p.user_id}</td>
      <td>${p.total_devices}</td>
      <td>${p.total_weight_kg} kg</td>
      <td>${p.preferred_date}</td>
      <td>${p.status}</td>
      <td>${p.pickup_address}</td>
      <td>${p.phone || '-'}</td>
      <td>${p.link ? `<a href="${p.link}" target="_blank">link</a>` : '-'}</td>
    </tr>`).join('') || '<tr><td colspan="9">No pickups yet</td></tr>';

  const transactionRows = rewardTransactions.map(r => `
    <tr>
      <td>${r.transaction_id}</td>
      <td>${r.user_id}</td>
      <td>${r.type}</td>
      <td>${r.points}</td>
      <td>${r.description || ''}</td>
    </tr>`).join('') || '<tr><td colspan="5">No reward transactions yet</td></tr>';

  res.send(`<!DOCTYPE html><html><head><title>EcoRecycle Data Viewer</title>
  <meta http-equiv="refresh" content="10">
  <style>
    body { font-family: sans-serif; background: #fff; color: #000; padding: 24px; max-width: 1400px; margin: 0 auto; }
    h1 { margin-bottom: 4px; }
    h2 { margin-top: 32px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px 12px; text-align: left; border: 1px solid #ccc; font-size: 13px; }
    th { background: #f5f5f5; font-weight: bold; }
    a { color: #2d6a4f; }
  </style></head><body>
  <h1>EcoRecycle Data Viewer</h1>
  <p>Auto-refreshes every 10 seconds &nbsp;|&nbsp; <a href="/api/docs" target="_blank">📄 Open Swagger API Docs</a></p>

  <h2>Users (${users.length})</h2>
  <table><thead><tr>
    <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Points</th><th>Password (hashed)</th>
  </tr></thead><tbody>${userRows}</tbody></table>

  <h2>Pickups (${pickups.length})</h2>
  <table><thead><tr>
    <th>ID</th><th>User ID</th><th>Devices</th><th>Weight</th><th>Date</th><th>Status</th><th>Address</th><th>Phone</th><th>Link</th>
  </tr></thead><tbody>${pickupRows}</tbody></table>

  <h2>Reward Transactions (${rewardTransactions.length})</h2>
  <table><thead><tr>
    <th>ID</th><th>User ID</th><th>Type</th><th>Points</th><th>Description</th>
  </tr></thead><tbody>${transactionRows}</tbody></table>
  </body></html>`);
});

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────────────────────
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('========================================================');
    console.log(` EcoRecycle BACKEND  →  http://localhost:${PORT}`);
    console.log(` Swagger API Docs    →  http://localhost:${PORT}/api/docs`);
    console.log(` Data Viewer         →  http://localhost:${PORT}/users`);
    console.log(` Data Viewer         →  http://localhost:${PORT}/api/users`);
    console.log(` Data Viewer         →  http://localhost:${PORT}/api/pickups`);
    console.log(` Data Viewer         →  http://localhost:${PORT}/api/categories`);
    console.log('========================================================');
    console.log(' No data yet? Run: npm run seed');
    console.log('');
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
