const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN
});

// Generate Refresh Token
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
  expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - company
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [client, vendor]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('company').notEmpty().trim().withMessage('Company is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const {
      name, email, password, company, role = 'client', locale = 'en', currency = 'USD'
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists with this email' }
      });
    }

    // Create user with default permissions based on role
    const defaultPermissions = {
      customer: [
        { module: 'products', actions: ['read'] },
        { module: 'configurator', actions: ['create', 'read', 'update'] },
        { module: 'quotes', actions: ['create', 'read'] },
        { module: 'requests', actions: ['create', 'read'] }
      ],
      vendor: [
        { module: 'products', actions: ['create', 'read', 'update'] },
        { module: 'inventory', actions: ['read', 'update'] }
      ],
      user: [
        { module: 'products', actions: ['read', 'update'] },
        { module: 'orders', actions: ['read', 'update'] },
        { module: 'quotes', actions: ['read', 'update'] }
      ],
      admin: [
        { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'orders', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'users', actions: ['read', 'update'] },
        { module: 'analytics', actions: ['read'] }
      ]
    };

    // Only allow customer and vendor registration publicly
    const allowedRoles = ['customer', 'vendor'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      company,
      role: userRole,
      locale,
      currency,
      permissions: defaultPermissions[role] || defaultPermissions.client,
      gdprConsent: true,
      gdprConsentDate: new Date(),
      dataProcessingConsent: true
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          locale: user.locale,
          currency: user.currency
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               twoFactorToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { email, password, twoFactorToken } = req.body;

    // Find user and include password for validation
    const user = await User.findOne({ email }).select('+passwordHash +twoFASecret');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: { message: 'Account is temporarily locked due to too many failed login attempts' }
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check 2FA if enabled
    if (user.twoFAEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          success: false,
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });

      if (!verified) {
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid two-factor authentication code' }
        });
      }
    }

    // Reset failed login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          locale: user.locale,
          currency: user.currency,
          twoFAEnabled: user.twoFAEnabled
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/setup-2fa:
 *   post:
 *     summary: Setup two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup information
 *       401:
 *         description: Unauthorized
 */
router.post('/setup-2fa', protect, async (req, res, next) => {
  try {
    const { user } = req;

    if (user.twoFAEnabled) {
      return res.status(400).json({
        success: false,
        error: { message: 'Two-factor authentication is already enabled' }
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `ERSOZ INC (${user.email})`,
      issuer: 'ERSOZ INC Platform'
    });

    // Store temporary secret (not enabled yet)
    user.twoFASecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/verify-2fa:
 *   post:
 *     summary: Verify and enable two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid token
 */
router.post('/verify-2fa', protect, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select('+twoFASecret');

    if (!user.twoFASecret) {
      return res.status(400).json({
        success: false,
        error: { message: 'Two-factor authentication setup not initiated' }
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid verification code' }
      });
    }

    // Enable 2FA
    user.twoFAEnabled = true;
    await user.save();

    res.json({
      success: true,
      data: { message: 'Two-factor authentication enabled successfully' }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/disable-2fa:
 *   post:
 *     summary: Disable two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid credentials
 */
router.post('/disable-2fa', protect, async (req, res, next) => {
  try {
    const { password, token } = req.body;
    const user = await User.findById(req.user.id).select('+passwordHash +twoFASecret');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid password' }
      });
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid verification code' }
      });
    }

    // Disable 2FA
    user.twoFAEnabled = false;
    user.twoFASecret = undefined;
    await user.save();

    res.json({
      success: true,
      data: { message: 'Two-factor authentication disabled successfully' }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Refresh token is required' }
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' }
    });
  }
});

module.exports = router;
