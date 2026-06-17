const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'db.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

// Set structural defaults (empty arrays/objects only — no bcrypt here)
db.defaults({
  users: [],
  pickups: [],
  rewards: [
    { id: 1, name: 'Bamboo Water Bottle', desc: 'BPA-free, keeps drinks cold 24h or hot 12h', pts: 200, cat: 'Lifestyle', emoji: '🧴', stock: 50 },
    { id: 2, name: 'Organic Cotton Tote Bag', desc: 'GOTS-certified, 10 kg capacity, reusable', pts: 120, cat: 'Bags', emoji: '👜', stock: 100 },
    { id: 3, name: 'Solar Phone Charger', desc: '10,000 mAh, dual USB, weatherproof', pts: 500, cat: 'Tech', emoji: '☀️', stock: 20 },
    { id: 4, name: 'Beeswax Food Wraps (3-pack)', desc: 'Replaces plastic wrap, washable & reusable', pts: 150, cat: 'Kitchen', emoji: '🍱', stock: 75 },
    { id: 5, name: 'Recycled Notebook', desc: '100% post-consumer paper, 120 pages', pts: 80, cat: 'Stationery', emoji: '📓', stock: 200 },
    { id: 6, name: 'Plant-Based Cleaning Kit', desc: 'Non-toxic, biodegradable, 4-bottle set', pts: 220, cat: 'Home', emoji: '🧹', stock: 30 },
    { id: 7, name: 'Seed Bomb Set', desc: 'Wildflower mix, supports local pollinators', pts: 60, cat: 'Garden', emoji: '🌱', stock: 150 },
    { id: 8, name: 'Compostable Phone Case', desc: 'Plant-based, fits most models, fully compostable', pts: 180, cat: 'Tech', emoji: '📱', stock: 40 },
  ],
  redemptions: [],
  articles: [
    { id: 1, title: 'Why E-Waste Recycling Matters', content: 'Electronic waste is the fastest-growing waste stream globally. Proper recycling prevents toxic materials from entering landfills and recovers valuable metals.', category: 'Awareness', author: 'EcoRecycle Team', createdAt: '2026-01-10' },
    { id: 2, title: 'How to Prepare Your Devices for Recycling', content: 'Before recycling your devices, back up your data, perform a factory reset, and remove any SIM cards or memory cards.', category: 'Guide', author: 'EcoRecycle Team', createdAt: '2026-02-15' },
  ],
  recyclingRecords: [],
}).write();

// Seed default admin/user accounts only if users array is empty
if (db.get('users').value().length === 0) {
  db.get('users').push(
    { id: 1, name: 'Admin', email: 'admin@staff.com', password: bcrypt.hashSync('123', 8), role: 'staff', points: 0 },
    { id: 2, name: 'kim',   email: 'kim@example.com', password: bcrypt.hashSync('123', 8), role: 'user',  points: 0 }
  ).write();
  console.log('✅ Seeded default users (admin@staff.com / kim@example.com, password: 123)');
}

module.exports = db;
