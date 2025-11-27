const User = require('../models/User');

/**
 * Auto-seed admin users on startup if they don't exist
 * This runs automatically without requiring shell access (perfect for hobby projects on Render)
 */
const autoSeedAdminUsers = async () => {
  try {
    // Define admin emails to check
    const adminEmails = [
      'admin@ersozinc.com',
      'superadmin@ersozinc.com',
      'manager@ersozinc.com',
      'sales@ersozinc.com',
      'support@ersozinc.com'
    ];

    // Check if owner account exists with correct role (most important check)
    const ownerExists = await User.findOne({
      email: 'admin@ersozinc.com',
      role: 'owner'
    });

    // If owner exists with correct role, assume seeding is complete
    if (ownerExists) {
      console.log('✅ Owner account exists with correct role, auto-seed already completed');
      return;
    }

    // Check if ANY users with admin emails exist (might have wrong data)
    const existingByEmail = await User.countDocuments({
      email: { $in: adminEmails }
    });

    // Clean up old/corrupt users with admin emails
    if (existingByEmail > 0) {
      console.log(`🧹 Found ${existingByEmail} old user(s) with admin emails, cleaning up...`);
      const deleteResult = await User.deleteMany({ email: { $in: adminEmails } });
      console.log(`✅ Deleted ${deleteResult.deletedCount} old user(s)`);
    }

    console.log('🌱 Auto-seeding admin users...');

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

    // Create all admin users with explicit reset of account locks
    const created = await User.insertMany(adminUsers);
    
    // Ensure all created users are unlocked
    await User.updateMany(
      { email: { $in: adminEmails } },
      { 
        $unset: { failedLoginAttempts: 1, lockUntil: 1 }
      }
    );

    console.log('✅ Auto-seed completed successfully!');
    console.log(`📝 Created ${created.length} admin users (all unlocked):`);
    console.log('   - Owner: admin@ersozinc.com / Admin123!@#');
    console.log('   - Super Admin: superadmin@ersozinc.com / SuperAdmin123!');
    console.log('   - Admin: manager@ersozinc.com / Manager123!');
    console.log('   - Sales: sales@ersozinc.com / Sales123!');
    console.log('   - Support: support@ersozinc.com / Support123!');
    console.log('⚠️  IMPORTANT: Change these passwords after first login!');
    console.log('🔐 You can now login at: /admin/login');

  } catch (error) {
    console.error('❌ Auto-seed failed:', error.message);
    // Don't crash the server if seeding fails
    console.log('⚠️  Server will continue, but you may need to seed users manually');
  }
};

module.exports = autoSeedAdminUsers;
