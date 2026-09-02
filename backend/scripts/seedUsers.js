require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/antarctic_twin';

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Station Administrator';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ username: ADMIN_USERNAME });
  if (existing) {
    console.log(`[Seed] Admin user '${ADMIN_USERNAME}' already exists. Skipping.`);
  } else {
    const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
    await User.create({
      username: ADMIN_USERNAME,
      passwordHash,
      role: 'admin',
      name: ADMIN_NAME
    });
    console.log(`[Seed] Created admin user '${ADMIN_USERNAME}' with role 'admin'.`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[Seed] Failed:', err.message);
  process.exit(1);
});
