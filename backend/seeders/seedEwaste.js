const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, DeviceCategory, Staff, PickupRequest, RequestDevice, RewardTransaction, Notification, UserImpact, Reward } = require('../models');

async function seed() {
  await sequelize.sync({ force: true }); // drops & recreates tables — dev only!

  // Demo login passwords (hashed for real, so login actually works):
  //   regular users → password123
  //   staff account → staff123
  const USER_PASSWORD  = bcrypt.hashSync('password123', 10);
  const STAFF_PASSWORD = bcrypt.hashSync('staff123', 10);

  // USERS — seeded with total_points = 0 (the hook builds it up, like the trigger did)
  const users = await User.bulkCreate([
    { full_name: 'Srey Leak',    email: 'sreyleak@gmail.com',   password_hash: USER_PASSWORD, phone: '012345678', address: 'House 12, St. 105, Daun Penh', city: 'Phnom Penh', latitude: 11.5625, longitude: 104.9160, total_points: 0, role: 'user' },
    { full_name: 'Dara Chhun',   email: 'darachhun@gmail.com',  password_hash: USER_PASSWORD, phone: '093456789', address: 'Room 5, Bldg A, Toul Kork', city: 'Phnom Penh', latitude: 11.5795, longitude: 104.9104, total_points: 0, role: 'user' },
    { full_name: 'Bopha Meas',   email: 'bophameas@gmail.com',  password_hash: USER_PASSWORD, phone: '077891234', address: 'No. 88, National Rd 3, Takeo', city: 'Takeo', latitude: 10.9908, longitude: 104.7985, total_points: 0, role: 'user' },
    { full_name: 'Rithy Sok',    email: 'rithysok@outlook.com', password_hash: USER_PASSWORD, phone: '085654321', address: 'Office 3F, Vattanac Tower', city: 'Phnom Penh', latitude: 11.5682, longitude: 104.9282, total_points: 0, role: 'user' },
    { full_name: 'Channary Ung', email: 'channary@yahoo.com',   password_hash: USER_PASSWORD, phone: '096123456', address: 'No. 5, St. 2004, Sen Sok', city: 'Phnom Penh', latitude: 11.5921, longitude: 104.8976, total_points: 0, role: 'user' },
    { full_name: 'Makara Phan',  email: 'makara@gmail.com',     password_hash: USER_PASSWORD, phone: '011789456', address: 'No. 23, Riverside, Siem Reap', city: 'Siem Reap', latitude: 13.3621, longitude: 103.8594, total_points: 0, role: 'user' },
    { full_name: 'Sreynich Lim', email: 'sreynich@gmail.com',   password_hash: USER_PASSWORD, phone: '070345678', address: 'No. 7, St. 60, Chamkar Mon', city: 'Phnom Penh', latitude: 11.5476, longitude: 104.9282, total_points: 0, role: 'user' },
    { full_name: 'Visal Kong',   email: 'visal.kong@gmail.com', password_hash: USER_PASSWORD, phone: '015234567', address: 'Flat 2B, Olympia City, 7 Makara', city: 'Phnom Penh', latitude: 11.5590, longitude: 104.9220, total_points: 0, role: 'user' },
    // Staff login account — logs into /staff (StaffDashboard) and can manage the Rewards Store
    { full_name: 'EcoRecycle Staff Admin', email: 'staff@ecorecycle.com', password_hash: STAFF_PASSWORD, phone: '010000000', address: 'EcoRecycle HQ', city: 'Phnom Penh', latitude: 11.5564, longitude: 104.9282, total_points: 0, role: 'staff' },
  ]);

  // DEVICE CATEGORIES
  const categories = await DeviceCategory.bulkCreate([
    { name: 'Mobile Phone',     description: 'Smartphones and basic mobile phones',            points_per_kg: 80.00 },
    { name: 'Laptop',           description: 'Laptops and notebooks',                           points_per_kg: 60.00 },
    { name: 'Tablet',           description: 'iPads and Android tablets',                       points_per_kg: 60.00 },
    { name: 'Battery',          description: 'Lithium-ion, AA, AAA and other battery types',    points_per_kg: 100.00 },
    { name: 'Television',       description: 'CRT and flat-screen TVs',                         points_per_kg: 30.00 },
    { name: 'Desktop Computer', description: 'Desktop PC towers and all-in-one computers',       points_per_kg: 40.00 },
    { name: 'Printer',          description: 'Inkjet, laser, and thermal printers',              points_per_kg: 25.00 },
    { name: 'Charger/Cable',    description: 'USB cables, power adapters, chargers',             points_per_kg: 120.00 },
    { name: 'Camera',           description: 'Digital cameras and camcorders',                   points_per_kg: 70.00 },
    { name: 'Other',            description: 'Any other electronic device not listed above',     points_per_kg: 20.00 },
  ]);

  // STAFF
  const staff = await Staff.bulkCreate([
    { full_name: 'Piseth Chea', role: 'collector', phone: '012111222', zone: 'Daun Penh / 7 Makara',  is_available: true,  rating: 4.92 },
    { full_name: 'Sophea Noun', role: 'collector', phone: '093222333', zone: 'Toul Kork / Sen Sok',   is_available: true,  rating: 4.85 },
    { full_name: 'Bunna Heng',  role: 'collector', phone: '077333444', zone: 'Chamkar Mon / BKK',     is_available: false, rating: 4.78 },
    { full_name: 'Ratana Keo',  role: 'collector', phone: '085444555', zone: 'Meanchey / Russey Keo', is_available: true,  rating: 4.90 },
    { full_name: 'Vannak Morn', role: 'collector', phone: '096555666', zone: 'Siem Reap City',        is_available: true,  rating: 4.70 },
   
  ]);


  // PICKUP REQUESTS
  const pickups = await PickupRequest.bulkCreate([
    { user_id: 1, staff_id: 1, status: 'completed',  pickup_address: 'House 12, St. 105, Daun Penh, Phnom Penh',    pickup_latitude: 11.5625, pickup_longitude: 104.9160, preferred_date: '2026-05-10', time_window_start: '09:00:00', time_window_end: '11:00:00', special_note: 'Leave at gate if not home',   total_devices: 2, total_weight_kg: 1.80, points_awarded: 120, completed_at: '2026-05-10 10:30:00' },
    { user_id: 1, staff_id: 1, status: 'completed',  pickup_address: 'House 12, St. 105, Daun Penh, Phnom Penh',    pickup_latitude: 11.5625, pickup_longitude: 104.9160, preferred_date: '2026-05-28', time_window_start: '14:00:00', time_window_end: '16:00:00', special_note: null,                          total_devices: 1, total_weight_kg: 0.90, points_awarded: 80,  completed_at: '2026-05-28 15:10:00' },
    { user_id: 2, staff_id: 2, status: 'completed',  pickup_address: 'Room 5, Bldg A, Toul Kork, Phnom Penh',       pickup_latitude: 11.5795, pickup_longitude: 104.9104, preferred_date: '2026-05-15', time_window_start: '09:00:00', time_window_end: '11:00:00', special_note: 'Call before arriving',        total_devices: 2, total_weight_kg: 3.50, points_awarded: 180, completed_at: '2026-05-15 09:55:00' },
    { user_id: 4, staff_id: 1, status: 'completed',  pickup_address: 'Vattanac Tower, Monivong Blvd, Phnom Penh',   pickup_latitude: 11.5682, pickup_longitude: 104.9282, preferred_date: '2026-05-20', time_window_start: '12:00:00', time_window_end: '14:00:00', special_note: 'Office lobby, ask for Rithy', total_devices: 5, total_weight_kg: 8.20, points_awarded: 340, completed_at: '2026-05-20 13:20:00' },
    { user_id: 7, staff_id: 3, status: 'completed',  pickup_address: 'No. 7, St. 60, Chamkar Mon, Phnom Penh',      pickup_latitude: 11.5476, pickup_longitude: 104.9282, preferred_date: '2026-06-01', time_window_start: '14:00:00', time_window_end: '16:00:00', special_note: null,                          total_devices: 3, total_weight_kg: 4.10, points_awarded: 210, completed_at: '2026-06-01 15:45:00' },
    { user_id: 5, staff_id: 2, status: 'confirmed',  pickup_address: 'No. 5, St. 2004, Sen Sok, Phnom Penh',        pickup_latitude: 11.5921, pickup_longitude: 104.8976, preferred_date: '2026-06-15', time_window_start: '09:00:00', time_window_end: '11:00:00', special_note: null,                          total_devices: 1, total_weight_kg: 0.50, points_awarded: 0,   completed_at: null },
    { user_id: 3, staff_id: 4, status: 'pending',    pickup_address: 'No. 88, National Rd 3, Takeo',                pickup_latitude: 10.9908, pickup_longitude: 104.7985, preferred_date: '2026-06-18', time_window_start: '14:00:00', time_window_end: '16:00:00', special_note: 'Near the market entrance',    total_devices: 1, total_weight_kg: 1.20, points_awarded: 0,   completed_at: null },
    { user_id: 8, staff_id: 2, status: 'in_transit', pickup_address: 'Flat 2B, Olympia City, 7 Makara, Phnom Penh', pickup_latitude: 11.5590, pickup_longitude: 104.9220, preferred_date: '2026-06-13', time_window_start: '09:00:00', time_window_end: '11:00:00', special_note: null,                          total_devices: 2, total_weight_kg: 2.30, points_awarded: 0,   completed_at: null },
    { user_id: 6, staff_id: 5, status: 'pending',    pickup_address: 'No. 23, Riverside, Siem Reap',                pickup_latitude: 13.3621, pickup_longitude: 103.8594, preferred_date: '2026-06-20', time_window_start: '14:00:00', time_window_end: '16:00:00', special_note: 'First time using the app',    total_devices: 2, total_weight_kg: 3.00, points_awarded: 0,   completed_at: null },
    { user_id: 4, staff_id: 1, status: 'completed',  pickup_address: 'Vattanac Tower, Monivong Blvd, Phnom Penh',   pickup_latitude: 11.5682, pickup_longitude: 104.9282, preferred_date: '2026-04-05', time_window_start: '09:00:00', time_window_end: '11:00:00', special_note: null,                          total_devices: 4, total_weight_kg: 6.50, points_awarded: 180, completed_at: '2026-04-05 10:15:00' },
  ]);

  // REQUEST DEVICES
  await RequestDevice.bulkCreate([
    { request_id: 1,  category_id: 1, quantity: 1, weight_kg: 0.20, condition_: 'broken',  notes: 'Cracked screen, no power' },
    { request_id: 1,  category_id: 2, quantity: 1, weight_kg: 1.60, condition_: 'broken',  notes: 'Old laptop, battery dead' },
    { request_id: 2,  category_id: 1, quantity: 1, weight_kg: 0.90, condition_: 'working', notes: 'Upgraded to new phone' },
    { request_id: 3,  category_id: 3, quantity: 1, weight_kg: 0.80, condition_: 'broken',  notes: 'Screen shattered' },
    { request_id: 3,  category_id: 4, quantity: 1, weight_kg: 2.70, condition_: 'unknown', notes: 'Mixed old batteries in bag' },
    { request_id: 4,  category_id: 2, quantity: 2, weight_kg: 4.20, condition_: 'broken',  notes: 'Office laptops end of life' },
    { request_id: 4,  category_id: 6, quantity: 1, weight_kg: 2.50, condition_: 'broken',  notes: 'Old desktop tower' },
    { request_id: 4,  category_id: 7, quantity: 1, weight_kg: 1.10, condition_: 'broken',  notes: 'Printer no longer works' },
    { request_id: 4,  category_id: 8, quantity: 1, weight_kg: 0.40, condition_: 'unknown', notes: 'Box of mixed chargers and cables' },
    { request_id: 5,  category_id: 1, quantity: 1, weight_kg: 0.80, condition_: 'broken',  notes: 'Water damaged' },
    { request_id: 5,  category_id: 5, quantity: 1, weight_kg: 2.50, condition_: 'broken',  notes: 'Old CRT television' },
    { request_id: 5,  category_id: 9, quantity: 1, weight_kg: 0.80, condition_: 'working', notes: 'Upgraded to mirrorless' },
    { request_id: 6,  category_id: 4, quantity: 1, weight_kg: 0.50, condition_: 'unknown', notes: 'Phone batteries' },
    { request_id: 7,  category_id: 5, quantity: 1, weight_kg: 1.20, condition_: 'broken',  notes: 'Old TV from living room' },
    { request_id: 8,  category_id: 1, quantity: 1, weight_kg: 0.20, condition_: 'broken',  notes: 'Dropped and shattered' },
    { request_id: 8,  category_id: 3, quantity: 1, weight_kg: 2.10, condition_: 'working', notes: 'Replaced by new tablet' },
    { request_id: 9,  category_id: 2, quantity: 1, weight_kg: 1.80, condition_: 'broken',  notes: 'Battery swollen' },
    { request_id: 9,  category_id: 1, quantity: 1, weight_kg: 1.20, condition_: 'broken',  notes: 'No longer turns on' },
    { request_id: 10, category_id: 2, quantity: 2, weight_kg: 4.10, condition_: 'broken',  notes: 'End of contract laptops' },
    { request_id: 10, category_id: 6, quantity: 1, weight_kg: 1.90, condition_: 'broken',  notes: 'Old office desktop' },
    { request_id: 10, category_id: 8, quantity: 1, weight_kg: 0.50, condition_: 'unknown', notes: 'Power banks and cables' },
  ]);

  // REWARD TRANSACTIONS — created one by one (not bulkCreate) so the
  // afterCreate hook fires for each row and builds up total_points,
  // exactly like the SQL trigger did
  const rewardTxRows = [
    { user_id: 1, request_id: 1,    type: 'earned',   points: 120, description: 'Pickup completed — 2 devices' },
    { user_id: 1, request_id: 2,    type: 'earned',   points: 80,  description: 'Pickup completed — 1 device' },
    { user_id: 1, request_id: null, type: 'redeemed', points: -60, description: 'Redeemed for coffee voucher at Brown Coffee' },
    { user_id: 1, request_id: null, type: 'redeemed', points: -80, description: 'Redeemed for 1 month parking at Aeon Mall' },
    { user_id: 2, request_id: 3,    type: 'earned',   points: 180, description: 'Pickup completed — 2 devices' },
    { user_id: 4, request_id: 4,    type: 'earned',   points: 340, description: 'Pickup completed — 5 office devices' },
    { user_id: 4, request_id: 10,   type: 'earned',   points: 180, description: 'Pickup completed — 4 devices' },
    { user_id: 7, request_id: 5,    type: 'earned',   points: 210, description: 'Pickup completed — 3 devices' },
    { user_id: 5, request_id: null, type: 'earned',   points: 90,  description: 'Referral bonus — invited Channary' },
    { user_id: 8, request_id: null, type: 'earned',   points: 75,  description: 'Sign-up bonus — first registration' },
  ];
  for (const row of rewardTxRows) {
    await RewardTransaction.create(row); // hook fires here, updates users.total_points
  }

  // REWARDS STORE — 6 items so the grid renders as a clean 2 rows × 3 columns
  await Reward.bulkCreate([
    { name: 'Strawberry Tote Bag',      description: 'Cute canvas tote bag with a strawberry print — perfect for grocery runs.', points_cost: 150, category: 'Lifestyle', emoji: '👜', image_url: '/rewards/strawberry-tote-bag.jpg', stock: 40, is_active: true },
    { name: 'Rosca Insulated Bottle',   description: 'Matte pastel stainless-steel water bottle that keeps drinks cold for hours.', points_cost: 250, category: 'Lifestyle', emoji: '🍶', image_url: '/rewards/rosca-water-bottle.jpg', stock: 30, is_active: true },
    { name: 'Reusable Coffee Cup',      description: 'Bamboo-lid reusable cup, good for hot or cold drinks on the go.',          points_cost: 100, category: 'Lifestyle', emoji: '☕', stock: 60, is_active: true },
    { name: '$5 Brown Coffee Voucher',  description: 'Voucher redeemable at any Brown Coffee branch in Phnom Penh.',            points_cost: 200, category: 'Vouchers',  emoji: '🎟️', stock: 25, is_active: true },
    { name: '1-Month Aeon Mall Parking',description: 'One month of free parking at Aeon Mall.',                                 points_cost: 300, category: 'Vouchers',  emoji: '🅿️', stock: 15, is_active: true },
    { name: 'Recycled Notebook Set',    description: 'Set of 3 notebooks made from 100% recycled paper.',                       points_cost: 80,  category: 'Stationery', emoji: '📓', stock: 50, is_active: true },
  ]);

  // NOTIFICATIONS
  await Notification.bulkCreate([
    { user_id: 1, title: 'Pickup Confirmed!',      message: 'Your pickup for 2 devices is confirmed for May 10, 9–11am. Staff assigned: Piseth Chea.', type: 'pickup',   is_read: true },
    { user_id: 1, title: 'Staff On The Way!',      message: 'Piseth is 20 minutes away. Please have your devices ready.',                            type: 'pickup',   is_read: true },
    { user_id: 1, title: 'You Earned 120 Points!', message: 'Great job! 120 points have been added to your account.',                                type: 'reward',   is_read: true },
    { user_id: 1, title: 'Time to Recycle Again?', message: 'It has been 30 days since your last pickup. Do you have more devices to recycle?',      type: 'reminder', is_read: false },
    { user_id: 2, title: 'Pickup Completed!',      message: 'Your 2 devices have been collected. 180 points added. Thank you for recycling!',        type: 'reward',   is_read: true },
    { user_id: 4, title: 'Bulk Pickup Confirmed!', message: 'Your office pickup for 5 devices is confirmed for May 20, 12–2pm.',                     type: 'pickup',   is_read: true },
    { user_id: 4, title: 'You Earned 340 Points!', message: '340 points added for your bulk office pickup. You are now a Gold Recycler!',           type: 'reward',   is_read: true },
    { user_id: 5, title: 'Pickup Scheduled',       message: 'Your pickup is confirmed for June 15, 9–11am. Staff assigned: Sophea Noun.',           type: 'pickup',   is_read: false },
    { user_id: 6, title: 'Welcome to E-Waste!',    message: 'Thank you for joining. Schedule your first pickup and start earning reward points.',    type: 'system',   is_read: false },
    { user_id: 8, title: 'Staff Is On The Way',    message: 'Your collector will arrive between 9–11am today. Please be available.',                type: 'pickup',   is_read: false },
  ]);

  // USER IMPACT
  await UserImpact.bulkCreate([
    { user_id: 1, total_devices: 3, total_weight_kg: 2.70,  co2_saved_kg: 5.40,  toxins_diverted_kg: 0.27, total_pickups: 2 },
    { user_id: 2, total_devices: 2, total_weight_kg: 3.50,  co2_saved_kg: 7.00,  toxins_diverted_kg: 0.35, total_pickups: 1 },
    { user_id: 3, total_devices: 1, total_weight_kg: 1.20,  co2_saved_kg: 2.40,  toxins_diverted_kg: 0.12, total_pickups: 0 },
    { user_id: 4, total_devices: 9, total_weight_kg: 14.70, co2_saved_kg: 29.40, toxins_diverted_kg: 1.47, total_pickups: 2 },
    { user_id: 5, total_devices: 1, total_weight_kg: 0.50,  co2_saved_kg: 1.00,  toxins_diverted_kg: 0.05, total_pickups: 0 },
    { user_id: 6, total_devices: 2, total_weight_kg: 3.00,  co2_saved_kg: 6.00,  toxins_diverted_kg: 0.30, total_pickups: 0 },
    { user_id: 7, total_devices: 3, total_weight_kg: 4.10,  co2_saved_kg: 8.20,  toxins_diverted_kg: 0.41, total_pickups: 1 },
    { user_id: 8, total_devices: 2, total_weight_kg: 2.30,  co2_saved_kg: 4.60,  toxins_diverted_kg: 0.23, total_pickups: 0 },
  ]);

  console.log('Seeding complete!');
  const final = await User.findAll({ attributes: ['user_id', 'full_name', 'total_points'] });
  console.log(final.map(u => `${u.full_name}: ${u.total_points}`).join('\n'));
  // Expect: 60, 180, 0, 520, 90, 0, 210, 75, 0 — matches your fixed totals
  console.log('\n--- Demo logins ---');
  console.log('Staff: staff@ecorecycle.com / staff123');
  console.log('User:  sreyleak@gmail.com / password123  (all other seeded users share password123)');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });