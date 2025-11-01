const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const QuoteRequest = require('../models/QuoteRequest');
const Configuration = require('../models/Configuration');
const Product = require('../models/Product');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /quotes:
 *   get:
 *     summary: Get quote requests with filtering
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Quote requests retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
    const skip = (page - 1) * limit;

    // Build filter based on user role
    const filter = {};
    if (req.user.role === 'client') {
      filter.userId = req.user.id;
    } else if (req.user.role === 'sales') {
      // Sales can see assigned quotes or unassigned ones
      filter.$or = [
        { 'workflow.assignedTo': req.user.id },
        { 'workflow.assignedTo': { $exists: false } }
      ];
    }
    // Admin can see all quotes (no additional filter)

    // Apply query filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter['workflow.priority'] = req.query.priority;
    }
    if (req.query.assignedTo) {
      filter['workflow.assignedTo'] = req.query.assignedTo;
    }
    if (req.query.company) {
      filter['clientInfo.companyName'] = { $regex: req.query.company, $options: 'i' };
    }

    const [quotes, total, statusCounts] = await Promise.all([
      QuoteRequest.find(filter)
        .populate('userId', 'name email company')
        .populate('configurationId', 'projectName calculations')
        .populate('workflow.assignedTo', 'name email')
        .populate('products.productId', 'name images category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      QuoteRequest.countDocuments(filter),
      
      // Get status counts for dashboard
      QuoteRequest.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Add calculated fields
    const quotesWithCalc = quotes.map(quote => ({
      ...quote,
      ageInDays: Math.floor((Date.now() - new Date(quote.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      totalQuotedAmount: quote.products.reduce((total, product) => {
        return total + (product.quotedPrice?.finalPrice || 0);
      }, 0)
    }));

    res.json({
      success: true,
      data: {
        quotes: quotesWithCalc,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total
        },
        summary: {
          total,
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes/{id}:
 *   get:
 *     summary: Get single quote request
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quote request retrieved successfully
 *       404:
 *         description: Quote request not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'client') {
      filter.userId = req.user.id;
    }

    const quote = await QuoteRequest.findOne(filter)
      .populate('userId', 'name email company contactInfo')
      .populate('configurationId')
      .populate('workflow.assignedTo', 'name email')
      .populate('products.productId')
      .populate('communications.createdBy', 'name')
      .populate('internalNotes.createdBy', 'name')
      .populate('followUps.assignedTo', 'name')
      .lean();

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote request not found' }
      });
    }

    // Calculate quote totals
    const totals = quote.calculateQuoteTotals ? quote.calculateQuoteTotals() : {
      subtotal: 0,
      totalDiscount: 0,
      tax: quote.quote?.taxAmount || 0,
      shipping: quote.quote?.shippingCost || 0,
      total: 0
    };

    res.json({
      success: true,
      data: { 
        quote: {
          ...quote,
          calculations: totals
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes:
 *   post:
 *     summary: Create new quote request
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               configurationId:
 *                 type: string
 *               projectDetails:
 *                 type: object
 *               products:
 *                 type: array
 *               attachments:
 *                 type: array
 *     responses:
 *       201:
 *         description: Quote request created successfully
 */
router.post('/', [
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product must be selected'),
  body('products.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('products.*.quantity.area')
    .isFloat({ min: 0.1 })
    .withMessage('Product area must be greater than 0')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    // Validate products exist
    const productIds = req.body.products.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds }, status: 'active' });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'One or more products not found or inactive' }
      });
    }

    const quoteRequest = await QuoteRequest.create({
      userId: req.user.id,
      clientInfo: {
        companyName: req.user.company,
        contactPerson: req.user.name,
        email: req.user.email,
        phone: req.user.contactInfo?.phone,
        address: req.user.contactInfo?.address
      },
      ...req.body,
      source: 'website',
      workflow: {
        priority: req.body.priority || 'medium',
        ...(req.body.workflow || {})
      }
    });

    // Auto-assign to available sales rep (simple round-robin)
    if (req.user.role === 'client') {
      const User = require('../models/User');
      const salesReps = await User.find({ role: 'sales', status: 'active' }).select('_id');
      if (salesReps.length > 0) {
        // Simple assignment logic - can be improved with load balancing
        const assignedRep = salesReps[Math.floor(Math.random() * salesReps.length)];
        quoteRequest.workflow.assignedTo = assignedRep._id;
        await quoteRequest.save();
      }
    }

    // Increment analytics for each product
    await Promise.all(
      productIds.map(productId => 
        Product.findByIdAndUpdate(productId, { $inc: { 'analytics.quoteRequests': 1 } })
      )
    );

    // Send real-time notifications
    if (req.io) {
      // Notify assigned sales rep
      if (quoteRequest.workflow.assignedTo) {
        req.io.to(`user:${quoteRequest.workflow.assignedTo}`).emit('quote:assigned', {
          quoteId: quoteRequest._id,
          quoteNumber: quoteRequest.quoteNumber,
          clientName: quoteRequest.clientInfo.companyName
        });
      }

      // Notify client
      req.io.to(`user:${req.user.id}`).emit('quote:created', {
        quoteId: quoteRequest._id,
        quoteNumber: quoteRequest.quoteNumber
      });
    }

    await quoteRequest.populate([
      { path: 'userId', select: 'name email company' },
      { path: 'workflow.assignedTo', select: 'name email' },
      { path: 'products.productId', select: 'name images category' }
    ]);

    res.status(201).json({
      success: true,
      data: { quote: quoteRequest }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes/{id}/status:
 *   put:
 *     summary: Update quote status (sales/admin only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put('/:id/status', authorize('admin', 'sales'), [
  body('status')
    .isIn(['new', 'reviewing', 'calculating', 'quote_prepared', 'quote_sent', 'negotiating', 'approved', 'rejected', 'expired', 'converted'])
    .withMessage('Invalid status')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const quote = await QuoteRequest.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote request not found' }
      });
    }

    await quote.updateStatus(req.body.status, req.user.id, req.body.note);

    // Send real-time update
    if (req.io) {
      req.io.to(`user:${quote.userId}`).emit('quote:statusUpdated', {
        quoteId: quote._id,
        quoteNumber: quote.quoteNumber,
        status: quote.status
      });
    }

    res.json({
      success: true,
      data: { 
        quote: {
          id: quote._id,
          status: quote.status,
          updatedAt: quote.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes/{id}/pricing:
 *   put:
 *     summary: Add pricing to quote (sales/admin only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *               quote:
 *                 type: object
 *     responses:
 *       200:
 *         description: Pricing updated successfully
 */
router.put('/:id/pricing', authorize('admin', 'sales'), async (req, res, next) => {
  try {
    const quote = await QuoteRequest.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote request not found' }
      });
    }

    // Update product pricing
    if (req.body.products) {
      req.body.products.forEach(productUpdate => {
        const product = quote.products.find(p => p._id.toString() === productUpdate.productId);
        if (product) {
          product.quotedPrice = productUpdate.quotedPrice;
        }
      });
    }

    // Update quote details
    if (req.body.quote) {
      quote.quote = {
        ...quote.quote,
        ...req.body.quote,
        breakdown: req.body.quote.breakdown || []
      };
    }

    // Auto-update status based on pricing completion
    if (quote.status === 'calculating' || quote.status === 'reviewing') {
      quote.status = 'quote_prepared';
    }

    await quote.save();

    // Send notification
    if (req.io) {
      req.io.to(`user:${quote.userId}`).emit('quote:pricingUpdated', {
        quoteId: quote._id,
        quoteNumber: quote.quoteNumber
      });
    }

    res.json({
      success: true,
      data: { 
        quote: {
          id: quote._id,
          status: quote.status,
          updatedAt: quote.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes/{id}/communications:
 *   post:
 *     summary: Add communication to quote
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - direction
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, phone, meeting, note]
 *               direction:
 *                 type: string
 *                 enum: [inbound, outbound]
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Communication added successfully
 */
router.post('/:id/communications', [
  body('type').isIn(['email', 'phone', 'meeting', 'note']).withMessage('Invalid communication type'),
  body('direction').isIn(['inbound', 'outbound']).withMessage('Invalid direction'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const quote = await QuoteRequest.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quote request not found' }
      });
    }

    await quote.addCommunication(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: { message: 'Communication added successfully' }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes/analytics:
 *   get:
 *     summary: Get quotes analytics (sales/admin only)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics/summary', authorize('admin', 'sales'), async (req, res, next) => {
  try {
    const period = req.query.period || 'month';
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const [statusStats, conversionStats, averageResponseTime, topProducts] = await Promise.all([
      // Status distribution
      QuoteRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Conversion rates
      QuoteRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
          }
        }
      ]),

      // Average response time (placeholder - would need more complex logic)
      QuoteRequest.aggregate([
        { $match: { status: 'quote_sent', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgResponseHours: { $avg: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 3600000] } }
          }
        }
      ]),

      // Top products by quote requests
      QuoteRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$products' },
        { 
          $group: { 
            _id: '$products.productId', 
            count: { $sum: 1 },
            totalValue: { $sum: '$products.quotedPrice.finalPrice' }
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period,
        statusDistribution: statusStats,
        conversion: conversionStats[0] || { total: 0, converted: 0, approved: 0 },
        averageResponseTime: averageResponseTime[0]?.avgResponseHours || 0,
        topProducts: topProducts.map(item => ({
          product: item.product[0],
          quoteCount: item.count,
          totalValue: item.totalValue || 0
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
