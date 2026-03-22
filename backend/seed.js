// ── Database Seed Script ──────────────────────────────────────
// Run: node seed.js
// Creates admin and demo passenger accounts for testing

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User   = require('./models/User');
const Reward = require('./models/Reward');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/umms';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed accounts
    await User.deleteMany({ email: { $in: ['admin@umms.com', 'demo@umms.com'] } });
    await Reward.deleteMany({});

    // Create Admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@umms.com',
      password: 'admin123',
      role: 'admin',
      city: 'London',
    });
    console.log('✅ Admin user created: admin@umms.com / admin123');

    // Create Demo passenger
    const demo = await User.create({
      name: 'Jane Smith',
      email: 'demo@umms.com',
      password: 'demo123',
      role: 'passenger',
      city: 'Manchester',
    });
    console.log('✅ Demo passenger created: demo@umms.com / demo123');

    // Create reward accounts with welcome points
    await Reward.create({
      user: admin._id,
      totalPoints: 250,
      lifetimePoints: 250,
      tier: 'bronze',
      transactions: [{ type: 'bonus', points: 250, description: 'Admin account bonus' }],
    });

    await Reward.create({
      user: demo._id,
      totalPoints: 150,
      lifetimePoints: 150,
      tier: 'bronze',
      transactions: [
        { type: 'bonus', points: 50,  description: 'Welcome bonus — join UMMS!' },
        { type: 'earned', points: 100, description: 'Seed: Sample eco-points' },
      ],
    });

    console.log('✅ Reward accounts created');
    console.log('\n🚀 Seed complete! You can now log in with:');
    console.log('   Passenger: demo@umms.com  / demo123');
    console.log('   Admin:     admin@umms.com / admin123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
