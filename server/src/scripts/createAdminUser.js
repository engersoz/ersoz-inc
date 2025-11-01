require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@ersozinc.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('');
      console.log('📧 Email: admin@ersozinc.com');
      console.log('🔑 Password: Admin@123456');
      console.log('');
      await mongoose.connection.close();
      return;
    }

    // Create admin user (password will be hashed by pre-save middleware)
    const admin = new User({
      name: 'Admin ERSOZ',
      email: 'admin@ersozinc.com',
      passwordHash: 'Admin@123456',  // Will be hashed by pre-save hook
      role: 'admin',
      company: 'ERSOZ INC',
      contactInfo: {
        phone: '+1234567890'
      },
      locale: 'en',
      currency: 'USD',
      isEmailVerified: true,
      isActive: true,
      permissions: []  // Admin has all permissions by default
    });

    await admin.save();

    console.log('✅✅✅ Admin user created successfully! ✅✅✅');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('        ADMIN LOGIN CREDENTIALS        ');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📧 Email:    admin@ersozinc.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Role:     Administrator');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/login');
    console.log('');

    await mongoose.connection.close();
    console.log('✅ Connection closed');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
