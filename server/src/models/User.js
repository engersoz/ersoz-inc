const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['owner', 'super_admin', 'admin', 'user', 'vendor', 'customer'],
    required: true,
    default: 'customer'
  },
  company: {
    type: String,
    trim: true,
    maxlength: 200
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  locale: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'tr']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'TRY']
  },
  // Enhanced security fields
  twoFAEnabled: {
    type: Boolean,
    default: false
  },
  twoFASecret: {
    type: String,
    select: false // Don't include in queries by default
  },
  lastLoginAt: {
    type: Date
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date
  },
  // Enhanced permissions for granular RBAC
  permissions: [{
    module: {
      type: String,
      enum: ['products', 'orders', 'inventory', 'analytics', 'notifications', 'configurator', 'quotes', 'requests', 'users', 'settings']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'export', 'import']
    }]
  }],
  // Profile preferences
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'imperial'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  // Email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  // Password reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  // GDPR compliance
  gdprConsent: {
    type: Boolean,
    default: false
  },
  gdprConsentDate: {
    type: Date
  },
  dataProcessingConsent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ company: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to increment failed login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { failedLoginAttempts: 1 }
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { failedLoginAttempts: 1, lockUntil: 1 }
  });
};

// Method to check if user has permission
userSchema.methods.hasPermission = function (module, action) {
  // Admin has all permissions
  if (this.role === 'admin') return true;

  const permission = this.permissions.find((p) => p.module === module);
  return permission && permission.actions.includes(action);
};

module.exports = mongoose.model('User', userSchema);
