const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized to access this route' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -twoFASecret');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'No user found with this token' }
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: { message: 'Account is temporarily locked due to too many failed login attempts' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized to access this route' }
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { message: `User role ${req.user.role} is not authorized to access this route` }
    });
  }
  next();
};

// Check specific permission
const checkPermission = (module, action) => (req, res, next) => {
  if (!req.user.hasPermission(module, action)) {
    return res.status(403).json({
      success: false,
      error: { message: `Not authorized to ${action} ${module}` }
    });
  }
  next();
};

// Optional auth - don't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash -twoFASecret');

      if (user && !user.isLocked) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  optionalAuth
};
