const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get inventory items with filtering
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *         description: Filter by warehouse
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (low_stock, out_of_stock, etc.)
 *       - in: query
 *         name: needsReorder
 *         schema:
 *           type: boolean
 *         description: Filter items needing reorder
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 */
router.get('/', authorize('admin', 'sales', 'vendor'), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.warehouseId) {
      filter['warehouse.id'] = req.query.warehouseId;
    }
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }
    if (req.query.status === 'active') {
      filter.status = 'active';
    }

    const [inventory, total, alerts] = await Promise.all([
      Inventory.find(filter)
        .populate('productId', 'name SKU category images basePrice')
        .sort({ 'stockLevels.availableStock': 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Inventory.countDocuments(filter),
      
      // Get active alerts
      Inventory.find({ 'alerts.acknowledged': false, status: 'active' })
        .populate('productId', 'name SKU')
        .select('productId alerts stockLevels warehouse')
        .limit(50)
        .lean()
    ]);

    // Add calculated fields
    const inventoryWithCalc = inventory.map(item => ({
      ...item,
      calculatedAvailableStock: Math.max(0, item.stockLevels.currentStock - item.stockLevels.reservedStock),
      needsReorder: item.stockLevels.availableStock <= item.thresholds.reorderPoint,
      stockStatus: item.stockLevels.availableStock === 0 ? 'out_of_stock' : 
                   item.stockLevels.availableStock <= item.thresholds.minimumStock ? 'low_stock' : 'in_stock'
    }));

    // Filter by calculated fields if requested
    let filteredInventory = inventoryWithCalc;
    if (req.query.needsReorder === 'true') {
      filteredInventory = inventoryWithCalc.filter(item => item.needsReorder);
    }
    if (req.query.stockStatus) {
      filteredInventory = inventoryWithCalc.filter(item => item.stockStatus === req.query.stockStatus);
    }

    res.json({
      success: true,
      data: {
        inventory: filteredInventory,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total
        },
        alerts: alerts.length,
        summary: {
          totalItems: total,
          needsReorder: inventoryWithCalc.filter(item => item.needsReorder).length,
          outOfStock: inventoryWithCalc.filter(item => item.stockStatus === 'out_of_stock').length,
          lowStock: inventoryWithCalc.filter(item => item.stockStatus === 'low_stock').length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /inventory/{id}:
 *   get:
 *     summary: Get single inventory item
 *     tags: [Inventory]
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
 *         description: Inventory item retrieved successfully
 */
router.get('/:id', authorize('admin', 'sales', 'vendor'), async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('productId')
      .populate('suppliers.supplierId', 'name contactInfo')
      .populate('tracking.movements.performedBy', 'name')
      .lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    // Add calculated fields
    const inventoryWithCalc = {
      ...inventory,
      calculatedAvailableStock: Math.max(0, inventory.stockLevels.currentStock - inventory.stockLevels.reservedStock),
      needsReorder: inventory.stockLevels.availableStock <= inventory.thresholds.reorderPoint,
      stockStatus: inventory.stockLevels.availableStock === 0 ? 'out_of_stock' : 
                   inventory.stockLevels.availableStock <= inventory.thresholds.minimumStock ? 'low_stock' : 'in_stock'
    };

    res.json({
      success: true,
      data: { inventory: inventoryWithCalc }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Create new inventory item (admin only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - warehouse
 *               - stockLevels
 *               - thresholds
 *             properties:
 *               productId:
 *                 type: string
 *               warehouse:
 *                 type: object
 *               stockLevels:
 *                 type: object
 *               thresholds:
 *                 type: object
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post('/', authorize('admin'), [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('warehouse.id').isMongoId().withMessage('Invalid warehouse ID'),
  body('warehouse.name').notEmpty().withMessage('Warehouse name is required'),
  body('stockLevels.currentStock').isFloat({ min: 0 }).withMessage('Current stock must be non-negative'),
  body('thresholds.reorderPoint').isFloat({ min: 0 }).withMessage('Reorder point must be non-negative'),
  body('thresholds.minimumStock').isFloat({ min: 0 }).withMessage('Minimum stock must be non-negative')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    // Check if product exists
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    // Check for duplicate product-warehouse combination
    const existing = await Inventory.findOne({
      productId: req.body.productId,
      'warehouse.id': req.body.warehouse.id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'Inventory item already exists for this product and warehouse' }
      });
    }

    const inventory = await Inventory.create({
      ...req.body,
      stockLevels: {
        ...req.body.stockLevels,
        availableStock: req.body.stockLevels.currentStock - (req.body.stockLevels.reservedStock || 0)
      },
      tracking: {
        lastStockCheck: new Date(),
        lastMovement: new Date(),
        stockCheckFrequency: 30,
        movements: [{
          type: 'adjustment',
          quantity: req.body.stockLevels.currentStock,
          reason: 'initial_stock',
          reference: 'setup',
          performedBy: req.user.id,
          timestamp: new Date(),
          notes: 'Initial inventory setup'
        }]
      }
    });

    // Check for initial alerts
    await inventory.checkAlerts();

    await inventory.populate('productId', 'name SKU category');

    res.status(201).json({
      success: true,
      data: { inventory }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /inventory/{id}/adjust:
 *   post:
 *     summary: Adjust inventory stock levels
 *     tags: [Inventory]
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
 *               - newQuantity
 *               - reason
 *             properties:
 *               newQuantity:
 *                 type: number
 *               reason:
 *                 type: string
 *               reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 */
router.post('/:id/adjust', authorize('admin', 'vendor'), [
  body('newQuantity').isFloat({ min: 0 }).withMessage('New quantity must be non-negative'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    const oldQuantity = inventory.stockLevels.currentStock;
    await inventory.adjustStock(
      req.body.newQuantity,
      req.body.reason,
      req.user.id,
      req.body.reference || ''
    );

    // Check for alerts after adjustment
    await inventory.checkAlerts();

    // Send real-time update
    if (req.io) {
      req.io.emit('inventory:adjusted', {
        inventoryId: inventory._id,
        productId: inventory.productId,
        oldQuantity,
        newQuantity: req.body.newQuantity,
        adjustedBy: req.user.name
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Stock adjusted successfully',
        oldQuantity,
        newQuantity: inventory.stockLevels.currentStock,
        availableStock: inventory.stockLevels.availableStock
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /inventory/{id}/reserve:
 *   post:
 *     summary: Reserve inventory stock
 *     tags: [Inventory]
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
 *               - quantity
 *               - reference
 *             properties:
 *               quantity:
 *                 type: number
 *               reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock reserved successfully
 */
router.post('/:id/reserve', authorize('admin', 'sales'), [
  body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be greater than 0'),
  body('reference').notEmpty().withMessage('Reference is required (quote ID, order ID, etc.)')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inventory item not found' }
      });
    }

    try {
      await inventory.reserveStock(req.body.quantity, req.body.reference);

      res.json({
        success: true,
        data: {
          message: 'Stock reserved successfully',
          reservedQuantity: req.body.quantity,
          availableStock: inventory.stockLevels.availableStock,
          totalReserved: inventory.stockLevels.reservedStock
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /inventory/alerts:
 *   get:
 *     summary: Get active inventory alerts
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 */
router.get('/system/alerts', authorize('admin', 'sales', 'vendor'), async (req, res, next) => {
  try {
    const alerts = await Inventory.find({
      'alerts.acknowledged': false,
      status: 'active'
    })
    .populate('productId', 'name SKU category')
    .select('productId alerts stockLevels warehouse thresholds')
    .sort({ 'alerts.triggeredAt': -1 })
    .lean();

    // Group alerts by type
    const groupedAlerts = {
      out_of_stock: [],
      low_stock: [],
      reorder: [],
      overstock: []
    };

    alerts.forEach(inventory => {
      inventory.alerts.forEach(alert => {
        if (!alert.acknowledged && groupedAlerts[alert.type]) {
          groupedAlerts[alert.type].push({
            inventoryId: inventory._id,
            product: inventory.productId,
            warehouse: inventory.warehouse,
            alert: {
              type: alert.type,
              message: alert.message,
              triggeredAt: alert.triggeredAt
            },
            stockLevels: inventory.stockLevels,
            thresholds: inventory.thresholds
          });
        }
      });
    });

    const totalAlerts = Object.values(groupedAlerts).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      data: {
        alerts: groupedAlerts,
        summary: {
          total: totalAlerts,
          outOfStock: groupedAlerts.out_of_stock.length,
          lowStock: groupedAlerts.low_stock.length,
          needsReorder: groupedAlerts.reorder.length,
          overstock: groupedAlerts.overstock.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /inventory/reports/stock-levels:
 *   get:
 *     summary: Get stock levels report
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *         description: Filter by warehouse
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *     responses:
 *       200:
 *         description: Stock levels report generated successfully
 */
router.get('/reports/stock-levels', authorize('admin', 'sales'), async (req, res, next) => {
  try {
    const filter = { status: 'active' };
    if (req.query.warehouseId) {
      filter['warehouse.id'] = req.query.warehouseId;
    }

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ];

    if (req.query.category) {
      pipeline.push({
        $match: { 'product.category': req.query.category }
      });
    }

    pipeline.push({
      $group: {
        _id: {
          warehouseId: '$warehouse.id',
          warehouseName: '$warehouse.name'
        },
        totalItems: { $sum: 1 },
        totalStock: { $sum: '$stockLevels.currentStock' },
        totalReserved: { $sum: '$stockLevels.reservedStock' },
        totalAvailable: { $sum: '$stockLevels.availableStock' },
        lowStockItems: {
          $sum: {
            $cond: [
              { $lte: ['$stockLevels.availableStock', '$thresholds.minimumStock'] },
              1,
              0
            ]
          }
        },
        outOfStockItems: {
          $sum: {
            $cond: [
              { $eq: ['$stockLevels.availableStock', 0] },
              1,
              0
            ]
          }
        },
        needsReorderItems: {
          $sum: {
            $cond: [
              { $lte: ['$stockLevels.availableStock', '$thresholds.reorderPoint'] },
              1,
              0
            ]
          }
        }
      }
    });

    const report = await Inventory.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        report,
        generatedAt: new Date(),
        filters: {
          warehouseId: req.query.warehouseId || null,
          category: req.query.category || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
