const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, checkPermission, optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const multer = require('multer');

const router = express.Router();

// Configure multer for image uploads (temporary - will be replaced with cloud storage)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 12, max 50)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, views, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = { status: 'active' };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.subcategory) {
      filter.subcategory = req.query.subcategory;
    }
    
    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: 'i' };
    }
    
    if (req.query.usage) {
      filter['specifications.usage'] = { $in: req.query.usage.split(',') };
    }
    
    if (req.query.inStock === 'true') {
      filter.availabilityStatus = { $in: ['in_stock', 'low_stock'] };
    }
    
    if (req.query.priceMin || req.query.priceMax) {
      filter.basePrice = {};
      if (req.query.priceMin) filter.basePrice.$gte = parseFloat(req.query.priceMin);
      if (req.query.priceMax) filter.basePrice.$lte = parseFloat(req.query.priceMax);
    }
    
    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Build sort query
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = {};
    
    if (sortBy === 'price') {
      sort.basePrice = sortOrder;
    } else if (sortBy === 'views') {
      sort['analytics.views'] = sortOrder;
    } else if (sortBy === 'name') {
      sort.name = sortOrder;
    } else {
      sort.createdAt = sortOrder;
    }
    
    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-createdBy -lastModifiedBy')
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Add calculated fields
    const productsWithCalc = products.map(product => ({
      ...product,
      primaryImage: product.images.find(img => img.isPrimary) || product.images[0] || null,
      currentPrice: product.pricing?.tiers?.[0]?.unitPrice || product.basePrice
    }));

    res.json({
      success: true,
      data: {
        products: productsWithCalc,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        filters: {
          categories: await Product.distinct('category', { status: 'active' }),
          brands: await Product.distinct('brand', { status: 'active', brand: { $ne: null } }),
          usageTypes: await Product.distinct('specifications.usage', { status: 'active' })
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get single product with full details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    // Increment view count (fire and forget)
    Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'analytics.views': 1 } }
    ).exec();

    // Add calculated fields
    const productWithCalc = {
      ...product,
      primaryImage: product.images.find(img => img.isPrimary) || product.images[0] || null,
      currentPrice: product.pricing?.tiers?.[0]?.unitPrice || product.basePrice,
      // Get related products
      relatedProducts: []
    };

    // Get related products (same category, excluding current)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active'
    })
    .select('name images basePrice pricing category')
    .limit(4)
    .lean();

    productWithCalc.relatedProducts = relatedProducts.map(p => ({
      ...p,
      primaryImage: p.images.find(img => img.isPrimary) || p.images[0] || null,
      currentPrice: p.pricing?.tiers?.[0]?.unitPrice || p.basePrice
    }));

    res.json({
      success: true,
      data: { product: productWithCalc }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (admin/sales only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - SKU
 *               - basePrice
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               SKU:
 *                 type: string
 *               basePrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', protect, authorize('admin', 'sales'), [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Name must be 1-200 characters'),
  body('category').isIn(['glass_mosaic', 'ceramic', 'mural', 'natural_stone', 'porcelain']).withMessage('Invalid category'),
  body('SKU').trim().isLength({ min: 1, max: 50 }).withMessage('SKU must be 1-50 characters'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description too long'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    // Check for duplicate SKU
    const existingProduct = await Product.findOne({ SKU: req.body.SKU });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product with this SKU already exists' }
      });
    }

    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
      // Set default pricing tier
      pricing: {
        tiers: [{
          minQuantity: 1,
          unitPrice: req.body.basePrice,
          currency: req.body.baseCurrency || 'USD'
        }],
        laborCostMultiplier: 1.2,
        wasteFactor: 0.1
      }
    });

    await product.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (admin/sales only)
 *     tags: [Products]
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
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id', protect, authorize('admin', 'sales'), [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['glass_mosaic', 'ceramic', 'mural', 'natural_stone', 'porcelain']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy lastModifiedBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}/upload:
 *   post:
 *     summary: Upload product images/videos
 *     tags: [Products]
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
 *         description: Files uploaded successfully
 */
router.post('/:id/upload', protect, authorize('admin', 'sales'), upload.array('files', 10), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No files provided' }
      });
    }

    // Process uploaded files (this would integrate with cloud storage in production)
    const processedFiles = req.files.map((file, index) => {
      const isImage = file.mimetype.startsWith('image/');
      const url = `/uploads/products/${product._id}/${file.filename}`;
      
      if (isImage) {
        return {
          url,
          altText: `${product.name} - Image ${product.images.length + index + 1}`,
          isPrimary: product.images.length === 0 && index === 0, // First image is primary if no images exist
          sortOrder: product.images.length + index,
          tags: []
        };
      } else {
        return {
          url,
          thumbnail: `/uploads/products/${product._id}/thumbnails/${file.filename}.jpg`,
          title: `${product.name} - Video ${product.videos?.length || 0 + index + 1}`,
          type: 'showcase'
        };
      }
    });

    // Update product with new files
    const images = processedFiles.filter(f => f.altText);
    const videos = processedFiles.filter(f => f.title);

    if (images.length > 0) {
      product.images.push(...images);
    }
    if (videos.length > 0) {
      product.videos = product.videos || [];
      product.videos.push(...videos);
    }

    await product.save();

    res.json({
      success: true,
      data: {
        message: `Uploaded ${req.files.length} files successfully`,
        images: images.length,
        videos: videos.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}/price:
 *   post:
 *     summary: Calculate price for quantity
 *     tags: [Products]
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
 *             properties:
 *               quantity:
 *                 type: number
 *               includeWaste:
 *                 type: boolean
 *               includeLabor:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Price calculated successfully
 */
router.post('/:id/price', async (req, res, next) => {
  try {
    const { quantity, includeWaste = true, includeLabor = false } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid quantity is required' }
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    const calculation = product.calculateTotalPrice(quantity, includeWaste, includeLabor);

    res.json({
      success: true,
      data: {
        calculation: {
          ...calculation,
          currency: product.baseCurrency,
          wasteFactor: product.pricing.wasteFactor,
          laborMultiplier: product.pricing.laborCostMultiplier
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Get all product categories and their counts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subcategories: { $addToSet: '$subcategory' },
          brands: { $addToSet: '$brand' },
          priceRange: {
            $push: {
              min: { $min: '$basePrice' },
              max: { $max: '$basePrice' }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
