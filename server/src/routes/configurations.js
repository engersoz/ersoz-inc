const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, checkPermission } = require('../middleware/auth');
const Configuration = require('../models/Configuration');
const Product = require('../models/Product');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /configurations:
 *   get:
 *     summary: Get user configurations
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Configurations retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [configurations, total] = await Promise.all([
      Configuration.find(filter)
        .populate('products.productId', 'name images basePrice category')
        .populate('relatedQuotes', 'quoteNumber status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Configuration.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        configurations,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations/{id}:
 *   get:
 *     summary: Get single configuration
 *     tags: [Configurations]
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
 *         description: Configuration retrieved successfully
 *       404:
 *         description: Configuration not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const configuration = await Configuration.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
    .populate('products.productId', 'name images basePrice category pricing specifications')
    .populate('relatedQuotes')
    .populate('workflow.assignedTo', 'name email')
    .lean();

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Configuration not found' }
      });
    }

    res.json({
      success: true,
      data: { configuration }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations:
 *   post:
 *     summary: Create new configuration
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectInfo
 *               - products
 *             properties:
 *               projectName:
 *                 type: string
 *               projectInfo:
 *                 type: object
 *               products:
 *                 type: array
 *     responses:
 *       201:
 *         description: Configuration created successfully
 */
router.post('/', [
  body('projectInfo.areaDetails.totalArea')
    .isFloat({ min: 0.1 })
    .withMessage('Total area must be greater than 0'),
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

    // Validate products exist and calculate pricing
    const productIds = req.body.products.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds }, status: 'active' });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'One or more products not found or inactive' }
      });
    }

    // Calculate pricing for each product
    const calculatedProducts = req.body.products.map(configProduct => {
      const product = products.find(p => p._id.toString() === configProduct.productId);
      const quantity = configProduct.quantity.area;
      const wastePercentage = configProduct.quantity.wastePercentage || 10;
      
      const calculation = product.calculateTotalPrice(quantity, true, false);
      
      return {
        ...configProduct,
        pricing: {
          unitPrice: calculation.unitPrice,
          subtotal: calculation.subtotal,
          wasteAmount: calculation.subtotal * (wastePercentage / 100),
          customizationCost: 0, // Will be calculated if customizations exist
          totalCost: calculation.total
        }
      };
    });

    const configuration = await Configuration.create({
      ...req.body,
      userId: req.user.id,
      products: calculatedProducts,
      preferences: {
        includeLaborEstimate: false,
        includeWasteFactor: true,
        preferredUnits: req.user.preferences?.units || 'imperial',
        ...req.body.preferences
      }
    });

    // Calculate totals
    configuration.calculateTotals();
    await configuration.save();

    // Populate for response
    await configuration.populate('products.productId', 'name images basePrice category');

    res.status(201).json({
      success: true,
      data: { configuration }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations/{id}:
 *   put:
 *     summary: Update configuration
 *     tags: [Configurations]
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
 *         description: Configuration updated successfully
 *       404:
 *         description: Configuration not found
 */
router.put('/:id', async (req, res, next) => {
  try {
    const configuration = await Configuration.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Configuration not found' }
      });
    }

    // Create new version if significant changes
    const hasSignificantChanges = req.body.products || req.body.projectInfo;
    if (hasSignificantChanges) {
      configuration.createVersion(req.user.id);
    }

    // Update configuration
    Object.assign(configuration, req.body);
    
    // Recalculate totals if products changed
    if (req.body.products) {
      configuration.calculateTotals();
    }

    await configuration.save();
    await configuration.populate('products.productId', 'name images basePrice category');

    res.json({
      success: true,
      data: { configuration }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations/{id}/calculate:
 *   post:
 *     summary: Recalculate configuration pricing
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               includeLaborEstimate:
 *                 type: boolean
 *               includeWasteFactor:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pricing recalculated successfully
 */
router.post('/:id/calculate', async (req, res, next) => {
  try {
    const configuration = await Configuration.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('products.productId');

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Configuration not found' }
      });
    }

    // Update preferences
    if (req.body.includeLaborEstimate !== undefined) {
      configuration.preferences.includeLaborEstimate = req.body.includeLaborEstimate;
    }
    if (req.body.includeWasteFactor !== undefined) {
      configuration.preferences.includeWasteFactor = req.body.includeWasteFactor;
    }

    // Recalculate each product
    configuration.products = configuration.products.map(configProduct => {
      const product = configProduct.productId;
      const quantity = configProduct.quantity.area;
      
      const calculation = product.calculateTotalPrice(
        quantity, 
        configuration.preferences.includeWasteFactor,
        configuration.preferences.includeLaborEstimate
      );
      
      return {
        ...configProduct,
        pricing: {
          unitPrice: calculation.unitPrice,
          subtotal: calculation.subtotal,
          wasteAmount: configuration.preferences.includeWasteFactor ? calculation.subtotal * product.pricing.wasteFactor : 0,
          customizationCost: configProduct.pricing.customizationCost || 0,
          totalCost: calculation.total
        }
      };
    });

    // Recalculate totals
    const totals = configuration.calculateTotals();
    configuration.status = 'calculated';

    await configuration.save();

    // Send real-time update if socket is available
    if (req.io) {
      req.io.to(`user:${req.user.id}`).emit('configuration:calculated', {
        configurationId: configuration._id,
        calculations: totals
      });
    }

    res.json({
      success: true,
      data: {
        configuration,
        calculations: totals
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations/{id}/quote:
 *   post:
 *     summary: Convert configuration to quote request
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectDetails:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quote request created successfully
 */
router.post('/:id/quote', async (req, res, next) => {
  try {
    const configuration = await Configuration.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('products.productId');

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Configuration not found' }
      });
    }

    // Import QuoteRequest model (avoid circular dependency)
    const QuoteRequest = require('../models/QuoteRequest');

    // Create quote request from configuration
    const quoteRequest = await QuoteRequest.create({
      userId: req.user.id,
      configurationId: configuration._id,
      clientInfo: {
        companyName: req.user.company,
        contactPerson: req.user.name,
        email: req.user.email,
        phone: req.user.contactInfo?.phone
      },
      projectDetails: req.body.projectDetails || {
        name: configuration.projectName,
        type: 'commercial'
      },
      products: configuration.products.map(p => ({
        productId: p.productId._id,
        specifications: p.selectedOptions,
        quantity: {
          area: p.quantity.area,
          unit: configuration.projectInfo.areaDetails.unit
        },
        usage: p.notes
      })),
      attachments: configuration.uploadedFiles || [],
      status: 'new'
    });

    // Update configuration status
    configuration.status = 'quote_requested';
    configuration.relatedQuotes.push(quoteRequest._id);
    await configuration.save();

    // Send real-time notification
    if (req.io) {
      req.io.to(`user:${req.user.id}`).emit('quote:created', {
        quoteId: quoteRequest._id,
        quoteNumber: quoteRequest.quoteNumber
      });
    }

    res.status(201).json({
      success: true,
      data: {
        quoteRequest: {
          id: quoteRequest._id,
          quoteNumber: quoteRequest.quoteNumber,
          status: quoteRequest.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations/{id}/duplicate:
 *   post:
 *     summary: Duplicate configuration
 *     tags: [Configurations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Configuration duplicated successfully
 */
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const originalConfig = await Configuration.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!originalConfig) {
      return res.status(404).json({
        success: false,
        error: { message: 'Configuration not found' }
      });
    }

    const configData = originalConfig.toObject();
    delete configData._id;
    delete configData.__v;
    delete configData.createdAt;
    delete configData.updatedAt;
    delete configData.relatedQuotes;

    // Update for duplicate
    configData.projectName = `${configData.projectName || 'Configuration'} (Copy)`;
    configData.status = 'draft';
    configData.version = 1;
    configData.previousVersions = [];

    const duplicatedConfig = await Configuration.create(configData);
    await duplicatedConfig.populate('products.productId', 'name images basePrice category');

    res.status(201).json({
      success: true,
      data: { configuration: duplicatedConfig }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /configurations/{id}:
 *   delete:
 *     summary: Delete configuration
 *     tags: [Configurations]
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
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const configuration = await Configuration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: { message: 'Configuration not found' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Configuration deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
