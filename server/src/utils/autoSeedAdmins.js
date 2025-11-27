const User = require('../models/User');

/**
 * Auto-seed admin users on startup if they don't exist
 * This runs automatically without requiring shell access (perfect for hobby projects on Render)
 */
const autoSeedAdminUsers = async () => {
  try {
    // Check if any internal staff users exist
    const existingAdmins = await User.countDocuments({
      role: { $in: ['owner', 'super_admin', 'admin'] }
    });

    // If admin users already exist, skip seeding
    if (existingAdmins > 0) {
      console.log('✅ Admin users already exist, skipping auto-seed');
      return;
    }

    console.log('🌱 No admin users found, auto-seeding...');

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
          { module: 'products', actions: ['read', 'update'] },
          { module: 'orders', actions: ['read', 'update'] },
          { module: 'quotes', actions: ['read', 'update'] }
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
          { module: 'orders', actions: ['read', 'update'] },
          { module: 'quotes', actions: ['read'] }
        ]
      }
    ];

    // Create all admin users
    await User.insertMany(adminUsers);

    console.log('✅ Auto-seed completed successfully!');
    console.log('📝 Created admin users:');
    console.log('   - Owner: admin@ersozinc.com / Admin123!@#');
    console.log('   - Super Admin: superadmin@ersozinc.com / SuperAdmin123!');
    console.log('   - Admin: manager@ersozinc.com / Manager123!');
    console.log('   - Sales: sales@ersozinc.com / Sales123!');
    console.log('   - Support: support@ersozinc.com / Support123!');
    console.log('⚠️  IMPORTANT: Change these passwords after first login!');

  } catch (error) {
    console.error('❌ Auto-seed failed:', error.message);
    // Don't crash the server if seeding fails
    console.log('⚠️  Server will continue, but you may need to seed users manually');
  }
};

module.exports = autoSeedAdminUsers;
