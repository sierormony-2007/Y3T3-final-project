/**
 * checkStaff.js — quick diagnostic to see exact DB values for staff accounts
 */
require('dotenv').config();
const { User } = require('./models');
const sequelize = require('./config/db');
const jwt = require('jsonwebtoken');

async function main() {
  await sequelize.authenticate();

  const admins = await User.findAll({ where: { role: 'staff' } });

  console.log('\n═══════════════════════════════════════════');
  console.log('  Staff accounts in DB:');
  console.log('═══════════════════════════════════════════');
  admins.forEach(u => {
    console.log(`  user_id    : ${u.user_id}`);
    console.log(`  email      : ${u.email}`);
    console.log(`  role       : ${u.role}`);
    console.log(`  staff_role : ${u.staff_role}  ← THIS must be 'admin'`);
    console.log('  ───────────────────────────────────────');

    // Simulate what JWT would contain
    const JWT_SECRET = process.env.JWT_SECRET || 'ecorecycle-secret-2026';
    const token = jwt.sign(
      { id: u.user_id, email: u.email, role: u.role || 'user', staff_role: u.staff_role || null },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`  JWT payload: role=${decoded.role}, staff_role=${decoded.staff_role}`);
    console.log(`  isAdmin check (staff_role==="admin"): ${decoded.staff_role === 'admin'}`);
    console.log('');
  });

  await sequelize.close();
}

main().catch(err => { console.error(err); process.exit(1); });
