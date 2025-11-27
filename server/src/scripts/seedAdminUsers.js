require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const adminUsers = [
  {
    name: 'Engin Ersoz',
    email: 'admin@ersozinc.com',
    passwordHash: 'Admin123!@#', // Will be hashed by pre-save middleware
    company: 'ERSOZ INC',
    role: 'owner',
    emailVerified: true,
    permissions: [] // Owner has all permissions by default
  },
  {
    name: 'Super Admin',
    email: 'superadmin@ersozinc.com',
    passwordHash: 'SuperAdmin123!',
    company: 'ERSOZ INC',
    role: 'super_admin',
    emailVerified: true,
    permissions: [
      { module: 'products', actions: ['create', 'read', 'update', 'delete', 'export', 'import'] },
      { module: 'orders', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'analytics', actions: ['read', 'export'] },
      { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'settings', actions: ['read', 'update'] },
      { module: 'quotes', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'notifications', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    name: 'Admin Manager',
    email: 'manager@ersozinc.com',
    passwordHash: 'Manager123!',
    company: 'ERSOZ INC',
    role: 'admin',
    emailVerified: true,
    permissions: [
      { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'orders', actions: ['read', 'update'] },
      { module: 'quotes', actions: ['read', 'update'] },
      { module: 'users', actions: ['read'] },
      { module: 'analytics', actions: ['read'] }
    ]
  },
  {
    name: 'Sales Staff',
    email: 'sales@ersozinc.com',
    passwordHash: 'Sales123!',
    company: 'ERSOZ INC',
    role: 'user',
    emailVerified: true,
    permissions: [
      { module: 'products', actions: ['read'] },
      { module: 'orders', actions: ['create', 'read', 'update'] },
      { module: 'quotes', actions: ['create', 'read', 'update'] }
    ]
  },
  {
    name: 'Support Staff',
    email: 'support@ersozinc.com',
    passwordHash: 'Support123!',
    company: 'ERSOZ INC',
    role: 'user',
    emailVerified: true,
    permissions: [
      { module: 'products', actions: ['read'] },
      { module: 'orders', actions: ['read'] },
      { module: 'quotes', actions: ['read'] }
    ]
  }
];

async function seedAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing admin users (optional - be careful in production!)
    const deleteConfirm = process.argv.includes('--clear');
    if (deleteConfirm) {
      await User.deleteMany({ role: { $in: ['owner', 'super_admin', 'admin', 'user'] } });
      console.log('🗑️  Cleared existing internal users');
    }

    // Create admin users
    for (const userData of adminUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists - skipping`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Admin users seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━'.repeat(60));
    adminUsers.forEach(u => {
      console.log(`Role: ${u.role.toUpperCase().padEnd(15)} | Email: ${u.email.padEnd(30)} | Password: ${u.passwordHash}`);
    });
    console.log('━'.repeat(60));
    console.log('\n🔐 Admin Login URL: /admin/login');
    console.log('⚠️  IMPORTANT: Change these passwords immediately after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdminUsers();
}

module.exports = seedAdminUsers;
