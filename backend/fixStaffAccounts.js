/**
 * fixStaffAccounts.js
 * Run once to ensure staff accounts exist in the DB with correct roles.
 * Usage: node fixStaffAccounts.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./models');
const sequelize = require('./config/db');

const STAFF_PASSWORD = 'staff123';

async function main() {
  await sequelize.authenticate();
  console.log('✅ DB connected');

  const hash = await bcrypt.hash(STAFF_PASSWORD, 10);

  // ── 1. Admin staff (can manage Rewards Store + accept/reject pickups) ─────
  const [adminUser, adminCreated] = await User.findOrCreate({
    where: { email: 'staff@ecorecycle.com' },
    defaults: {
      full_name:     'EcoRecycle Staff Admin',
      email:         'staff@ecorecycle.com',
      password_hash: hash,
      phone:         '010000000',
      address:       'EcoRecycle HQ',
      city:          'Phnom Penh',
      latitude:      11.5564,
      longitude:     104.9282,
      total_points:  0,
      role:          'staff',
      staff_role:    'admin',
    },
  });

  if (!adminCreated) {
    // Make sure the role fields are correct even if the row already existed
    adminUser.role       = 'staff';
    adminUser.staff_role = 'admin';
    await adminUser.save();
    console.log('🔄 Admin staff account updated →', adminUser.email);
  } else {
    console.log('✨ Admin staff account created →', adminUser.email);
  }

  // ── 2. Operator staff (can only accept/reject pickups) ────────────────────
  const [operatorUser, operatorCreated] = await User.findOrCreate({
    where: { email: 'operator@ecorecycle.com' },
    defaults: {
      full_name:     'EcoRecycle Staff Operator',
      email:         'operator@ecorecycle.com',
      password_hash: hash,
      phone:         '010000001',
      address:       'EcoRecycle HQ',
      city:          'Phnom Penh',
      latitude:      11.5564,
      longitude:     104.9282,
      total_points:  0,
      role:          'staff',
      staff_role:    'operator',
    },
  });

  if (!operatorCreated) {
    operatorUser.role       = 'staff';
    operatorUser.staff_role = 'operator';
    await operatorUser.save();
    console.log('🔄 Operator staff account updated →', operatorUser.email);
  } else {
    console.log('✨ Operator staff account created →', operatorUser.email);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Staff Accounts Ready');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin (full access):');
  console.log('    Email:    staff@ecorecycle.com');
  console.log('    Password: staff123');
  console.log('    Role:     staff / admin  → can manage Rewards Store');
  console.log('');
  console.log('  Operator (limited access):');
  console.log('    Email:    operator@ecorecycle.com');
  console.log('    Password: staff123');
  console.log('    Role:     staff / operator → accept/reject pickups only');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await sequelize.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});
