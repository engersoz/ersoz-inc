const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const QuoteRequest = require('../models/QuoteRequest');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

const router = express.Router();

// All routes require admin or sales authentication
router.use(protect);
router.use(authorize('admin', 'sales'));

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get main dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 */
router.get('/dashboard', async (req, res, next) => {
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

    const [quoteStats, productStats, inventoryStats, userStats] = await Promise.all([
      // Quote statistics
      QuoteRequest.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $in: ['$status', ['new', 'reviewing', 'calculating']] }, 1, 0] } },
            active: { $sum: { $cond: [{ $in: ['$status', ['quote_sent', 'negotiating']] }, 1, 0] } }
          }
        }
      ]),

      // Product performance
      Product.aggregate([
        {
          $project: {
            name: 1,
            SKU: 1,
            category: 1,
            totalViews: '$analytics.views',
            totalQuoteRequests: '$analytics.quoteRequests',
            conversionRate: {
              $cond: [
                { $eq: ['$analytics.views', 0] },
                0,
                { $multiply: [{ $divide: ['$analytics.quoteRequests', '$analytics.views'] }, 100] }
              ]
            }
          }
        },
        { $sort: { totalQuoteRequests: -1 } },
        { $limit: 10 }
      ]),

      // Inventory alerts
      Inventory.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            lowStock: {
              $sum: {
                $cond: [
                  { $lte: ['$stockLevels.availableStock', '$thresholds.minimumStock'] },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ['$stockLevels.availableStock', 0] }, 1, 0]
              }
            },
            needsReorder: {
              $sum: {
                $cond: [
                  { $lte: ['$stockLevels.availableStock', '$thresholds.reorderPoint'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // User statistics
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Quote trend over time
    const quoteTrend = await QuoteRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Calculate conversion rate
    const quoteData = quoteStats[0] || { total: 0, converted: 0, pending: 0, active: 0 };
    const conversionRate = quoteData.total > 0 
      ? ((quoteData.converted / quoteData.total) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        period,
        generatedAt: new Date().toISOString(),
        quotes: {
          ...quoteData,
          conversionRate: parseFloat(conversionRate)
        },
        products: {
          topPerformers: productStats,
          totalActive: await Product.countDocuments({ status: 'active' })
        },
        inventory: inventoryStats[0] || { total: 0, lowStock: 0, outOfStock: 0, needsReorder: 0 },
        users: {
          newUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
          byRole: userStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        },
        trends: {
          quotes: quoteTrend
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Get sales analytics and reports
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       200:
 *         description: Sales analytics retrieved successfully
 */
router.get('/sales', async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const groupBy = req.query.groupBy || 'day';

    // Determine grouping format
    let dateGroup;
    switch (groupBy) {
      case 'week':
        dateGroup = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await QuoteRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['converted', 'approved'] }
        }
      },
      {
        $group: {
          _id: dateGroup,
          totalQuotes: { $sum: 1 },
          totalValue: { $sum: '$quote.totalPrice' },
          averageValue: { $avg: '$quote.totalPrice' },
          products: { $push: '$products' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top selling products
    const topProducts = await QuoteRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['converted', 'approved'] }
        }
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity.area' },
          totalValue: { $sum: '$products.quotedPrice.finalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Sales by category
    const categoryPerformance = await QuoteRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['converted', 'approved'] }
        }
      },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalValue: { $sum: '$products.quotedPrice.finalPrice' },
          totalQuantity: { $sum: '$products.quantity.area' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Calculate totals
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.totalQuotes, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      success: true,
      data: {
        period: {
          startDate,
          endDate,
          groupBy
        },
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue
        },
        salesOverTime: salesData,
        topProducts: topProducts.map(item => ({
          product: {
            id: item.product._id,
            name: item.product.name,
            SKU: item.product.SKU,
            category: item.product.category
          },
          totalQuantity: item.totalQuantity,
          totalValue: item.totalValue,
          orderCount: item.orderCount
        })),
        categoryPerformance
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /analytics/products:
 *   get:
 *     summary: Get product performance analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [views, quoteRequests, conversion]
 *     responses:
 *       200:
 *         description: Product analytics retrieved successfully
 */
router.get('/products', async (req, res, next) => {
  try {
    const filter = { status: 'active' };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const sortBy = req.query.sortBy || 'quoteRequests';
    const sortField = sortBy === 'views' ? 'analytics.views' 
                    : sortBy === 'conversion' ? 'conversionRate'
                    : 'analytics.quoteRequests';

    const products = await Product.aggregate([
      { $match: filter },
      {
        $project: {
          name: 1,
          SKU: 1,
          category: 1,
          basePrice: 1,
          images: 1,
          views: '$analytics.views',
          quoteRequests: '$analytics.quoteRequests',
          conversionRate: {
            $cond: [
              { $eq: ['$analytics.views', 0] },
              0,
              { $multiply: [{ $divide: ['$analytics.quoteRequests', '$analytics.views'] }, 100] }
            ]
          },
          lastViewed: '$analytics.lastViewed'
        }
      },
      { $sort: { [sortField]: -1 } },
      { $limit: 50 }
    ]);

    // Category statistics
    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' },
          totalQuoteRequests: { $sum: '$analytics.quoteRequests' },
          avgPrice: { $avg: '$basePrice.amount' }
        }
      },
      { $sort: { totalQuoteRequests: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        products,
        categoryStats,
        filters: {
          category: req.query.category || null,
          sortBy
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /analytics/inventory:
 *   get:
 *     summary: Get inventory analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory analytics retrieved successfully
 */
router.get('/inventory', async (req, res, next) => {
  try {
    const filter = { status: 'active' };
    if (req.query.warehouseId) {
      filter['warehouse.id'] = req.query.warehouseId;
    }

    const [overviewStats, warehouseStats, categoryStats, alertStats] = await Promise.all([
      // Overall inventory statistics
      Inventory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
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
                $cond: [{ $eq: ['$stockLevels.availableStock', 0] }, 1, 0]
              }
            }
          }
        }
      ]),

      // Warehouse breakdown
      Inventory.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: {
              warehouseId: '$warehouse.id',
              warehouseName: '$warehouse.name'
            },
            totalItems: { $sum: 1 },
            totalStock: { $sum: '$stockLevels.currentStock' },
            availableStock: { $sum: '$stockLevels.availableStock' },
            lowStockCount: {
              $sum: {
                $cond: [
                  { $lte: ['$stockLevels.availableStock', '$thresholds.minimumStock'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Category distribution
      Inventory.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            totalItems: { $sum: 1 },
            totalStock: { $sum: '$stockLevels.availableStock' }
          }
        },
        { $sort: { totalStock: -1 } }
      ]),

      // Active alerts
      Inventory.aggregate([
        { $match: { 'alerts.acknowledged': false, status: 'active' } },
        { $unwind: '$alerts' },
        { $match: { 'alerts.acknowledged': false } },
        {
          $group: {
            _id: '$alerts.type',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Stock movement history (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const movementHistory = await Inventory.aggregate([
      { $match: filter },
      { $unwind: '$tracking.movements' },
      { $match: { 'tracking.movements.timestamp': { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$tracking.movements.timestamp' },
            month: { $month: '$tracking.movements.timestamp' },
            day: { $dayOfMonth: '$tracking.movements.timestamp' },
            type: '$tracking.movements.type'
          },
          totalQuantity: { $sum: '$tracking.movements.quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: overviewStats[0] || {
          totalItems: 0,
          totalStock: 0,
          totalReserved: 0,
          totalAvailable: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        },
        warehouses: warehouseStats,
        categories: categoryStats,
        alerts: alertStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        movementHistory,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /analytics/users:
 *   get:
 *     summary: Get user analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get('/users', authorize('admin'), async (req, res, next) => {
  try {
    const [userStats, roleDistribution, recentActivity, topClients] = await Promise.all([
      // Overall user statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
          }
        }
      ]),

      // Role distribution
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),

      // Recent user registrations
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email company role createdAt status')
        .lean(),

      // Top clients by quote requests
      QuoteRequest.aggregate([
        {
          $group: {
            _id: '$userId',
            totalQuotes: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
          }
        },
        { $sort: { totalQuotes: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ])
    ]);

    // User growth over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: userStats[0] || { total: 0, active: 0, inactive: 0 },
        roleDistribution: roleDistribution.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        recentRegistrations: recentActivity,
        topClients: topClients.map(item => ({
          user: {
            id: item.user._id,
            name: item.user.name,
            email: item.user.email,
            company: item.user.company
          },
          totalQuotes: item.totalQuotes,
          converted: item.converted,
          conversionRate: item.totalQuotes > 0 
            ? ((item.converted / item.totalQuotes) * 100).toFixed(2)
            : 0
        })),
        userGrowth,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export analytics data as CSV
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: report
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sales, products, inventory, users]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: CSV file generated
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export', async (req, res, next) => {
  try {
    const reportType = req.query.report;
    if (!reportType) {
      return res.status(400).json({
        success: false,
        error: { message: 'Report type is required' }
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    let csvData = '';
    let filename = `${reportType}_report_${Date.now()}.csv`;

    switch (reportType) {
      case 'sales':
        const salesData = await QuoteRequest.find({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['converted', 'approved'] }
        }).populate('userId', 'name email company').lean();

        csvData = 'Quote Number,Client,Company,Created Date,Status,Total Value\n';
        salesData.forEach(quote => {
          csvData += `${quote.quoteNumber},${quote.userId?.name},${quote.clientInfo.companyName},${quote.createdAt.toISOString()},${quote.status},${quote.quote?.totalPrice || 0}\n`;
        });
        break;

      case 'products':
        const products = await Product.find({ status: 'active' }).lean();
        csvData = 'SKU,Name,Category,Price,Views,Quote Requests,Conversion Rate\n';
        products.forEach(product => {
          const conversionRate = product.analytics.views > 0 
            ? ((product.analytics.quoteRequests / product.analytics.views) * 100).toFixed(2)
            : 0;
          csvData += `${product.SKU},${product.name},${product.category},${product.basePrice.amount},${product.analytics.views},${product.analytics.quoteRequests},${conversionRate}%\n`;
        });
        break;

      case 'inventory':
        const inventory = await Inventory.find({ status: 'active' })
          .populate('productId', 'name SKU')
          .lean();
        csvData = 'SKU,Product,Warehouse,Current Stock,Reserved,Available,Status\n';
        inventory.forEach(item => {
          const status = item.stockLevels.availableStock === 0 ? 'Out of Stock'
                       : item.stockLevels.availableStock <= item.thresholds.minimumStock ? 'Low Stock'
                       : 'In Stock';
          csvData += `${item.productId?.SKU},${item.productId?.name},${item.warehouse.name},${item.stockLevels.currentStock},${item.stockLevels.reservedStock},${item.stockLevels.availableStock},${status}\n`;
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid report type' }
        });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
