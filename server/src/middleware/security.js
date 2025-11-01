const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// GDPR Compliance middleware
const gdprCompliance = {
  // Track user consent
  trackConsent: (req, res, next) => {
    if (req.user) {
      // Would store consent in database
      req.userConsent = {
        marketing: req.cookies.marketingConsent === 'true',
        analytics: req.cookies.analyticsConsent === 'true',
        necessary: true // Always true
      };
    }
    next();
  },

  // Data encryption helper
  encryptPersonalData: (data) => {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  },

  // Data decryption helper
  decryptPersonalData: (encrypted, ivHex) => {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  },

  // Data anonymization
  anonymizeData: (user) => {
    return {
      id: user.id,
      role: user.role,
      createdAt: user.createdAt,
      // Remove all PII
      name: '[ANONYMIZED]',
      email: '[ANONYMIZED]',
      phone: '[ANONYMIZED]',
      company: '[ANONYMIZED]'
    };
  },

  // Right to be forgotten - Data deletion
  deleteUserData: async (userId) => {
    // In production, this would:
    // 1. Anonymize user records
    // 2. Delete personal data
    // 3. Keep essential transaction records (legal requirement)
    // 4. Log deletion request
    
    console.log(`GDPR: Deleting data for user ${userId}`);
    return {
      success: true,
      message: 'User data deletion initiated. Will be completed within 30 days as per GDPR.'
    };
  },

  // Data export (Right to access)
  exportUserData: async (userId) => {
    // In production, would gather all user data
    return {
      personalInfo: { /* user data */ },
      activity: { /* activity logs */ },
      transactions: { /* transaction history */ },
      consent: { /* consent records */ },
      exportedAt: new Date().toISOString()
    };
  }
};

// Security headers using Helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL || 'http://localhost:5000']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting to prevent abuse
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  auth: createRateLimiter(15 * 60 * 1000, 5), // 5 login attempts per 15 minutes
  api: createRateLimiter(60 * 1000, 30), // 30 requests per minute
  upload: createRateLimiter(60 * 60 * 1000, 10) // 10 uploads per hour
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Remove potential XSS vectors
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      }
    });
  }
  
  // Sanitize body
  if (req.body) {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    sanitizeObject(req.body);
  }
  
  next();
};

// CSRF Protection
const csrfProtection = (req, res, next) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED'
      }
    });
  }
  
  next();
};

// Generate CSRF token
const generateCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Audit logging
const auditLog = (action, details = {}) => {
  return (req, res, next) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: req.user?.id || 'anonymous',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      details,
      path: req.path,
      method: req.method
    };
    
    // In production, would store in database or external logging service
    console.log('[AUDIT]', JSON.stringify(logEntry));
    
    // Attach to request for further processing
    req.auditLog = logEntry;
    
    next();
  };
};

// Data retention policy
const dataRetentionPolicy = {
  // Define retention periods (in days)
  policies: {
    userActivity: 90,
    auditLogs: 365,
    sessionData: 30,
    backups: 30,
    temporaryFiles: 7
  },
  
  // Cleanup old data
  cleanup: async (dataType) => {
    const retentionDays = dataRetentionPolicy.policies[dataType] || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    console.log(`Cleaning up ${dataType} older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);
    
    // In production, would delete old records from database
    return {
      success: true,
      dataType,
      cutoffDate,
      recordsDeleted: 0
    };
  }
};

// Password strength validator
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;
  
  return {
    valid: score >= 4,
    score,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

// IP Whitelist/Blacklist
const ipFilter = {
  whitelist: process.env.IP_WHITELIST?.split(',') || [],
  blacklist: process.env.IP_BLACKLIST?.split(',') || [],
  
  middleware: (req, res, next) => {
    const clientIp = req.ip;
    
    // Check blacklist first
    if (ipFilter.blacklist.includes(clientIp)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'IP_BLACKLISTED'
        }
      });
    }
    
    // If whitelist is configured, check it
    if (ipFilter.whitelist.length > 0 && !ipFilter.whitelist.includes(clientIp)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'IP_NOT_WHITELISTED'
        }
      });
    }
    
    next();
  }
};

// Sensitive data masking for logs
const maskSensitiveData = (data) => {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
  const masked = { ...data };
  
  Object.keys(masked).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });
  
  return masked;
};

// Session security
const secureSession = {
  config: {
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    }
  },
  
  // Regenerate session ID on privilege escalation
  regenerate: (req, callback) => {
    req.session.regenerate((err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }
};

module.exports = {
  gdprCompliance,
  securityHeaders,
  rateLimiters,
  createRateLimiter,
  sanitizeInput,
  csrfProtection,
  generateCsrfToken,
  auditLog,
  dataRetentionPolicy,
  validatePasswordStrength,
  ipFilter,
  maskSensitiveData,
  secureSession
};
