const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['glass_mosaic', 'ceramic', 'mural', 'natural_stone', 'porcelain'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    trim: true,
    index: true
  },
  SKU: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  // Base product information
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  baseCurrency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'TRY']
  },
  // Enhanced media handling
  images: [{
    url: { type: String, required: true },
    altText: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    tags: [String] // For image categorization (front, back, detail, etc.)
  }],
  videos: [{
    url: { type: String, required: true },
    thumbnail: String,
    title: String,
    duration: Number, // in seconds
    type: { type: String, enum: ['demo', 'installation', 'showcase'], default: 'showcase' }
  }],
  // Technical specifications
  specifications: {
    dimensions: {
      length: Number, // in mm
      width: Number, // in mm
      thickness: Number // in mm
    },
    material: String,
    finish: String,
    texture: String,
    usage: [{ type: String, enum: ['interior', 'exterior', 'pool', 'kitchen', 'bathroom', 'floor', 'wall'] }],
    resistance: {
      water: Boolean,
      frost: Boolean,
      slip: { type: String, enum: ['R9', 'R10', 'R11', 'R12', 'R13'] }
    },
    certifications: [String] // ISO, CE, etc.
  },
  // Pricing structure with tiers
  pricing: {
    tiers: [{
      minQuantity: { type: Number, required: true, default: 1 },
      unitPrice: { type: Number, required: true },
      currency: { type: String, default: 'USD' }
    }],
    laborCostMultiplier: { type: Number, default: 1.2 }, // For installation estimates
    wasteFactor: { type: Number, default: 0.1 } // 10% waste factor
  },
  // Multi-language support
  translations: [{
    locale: { type: String, required: true },
    name: String,
    description: String,
    specifications: mongoose.Schema.Types.Mixed
  }],
  // SEO and search
  tags: [String],
  searchKeywords: [String],
  // Product status and availability
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'seasonal'],
    default: 'active',
    index: true
  },
  availabilityStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order', 'discontinued'],
    default: 'in_stock',
    index: true
  },
  // Configurator integration
  configuratorSettings: {
    allowCustomColors: { type: Boolean, default: false },
    allowCustomSizes: { type: Boolean, default: false },
    minOrderQuantity: { type: Number, default: 1 },
    maxOrderQuantity: Number,
    customizationOptions: [{
      name: String,
      type: { type: String, enum: ['color', 'size', 'pattern', 'finish'] },
      options: [String],
      priceModifier: Number // Additional cost/discount
    }]
  },
  // Analytics tracking
  analytics: {
    views: { type: Number, default: 0 },
    configurationCount: { type: Number, default: 0 },
    quoteRequests: { type: Number, default: 0 },
    orders: { type: Number, default: 0 }
  },
  // Admin fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ SKU: 1 });
productSchema.index({ status: 1, availabilityStatus: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ searchKeywords: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'analytics.views': -1 });

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  searchKeywords: 'text'
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

// Virtual for current price (base tier)
productSchema.virtual('currentPrice').get(function () {
  return this.pricing.tiers.length > 0 ? this.pricing.tiers[0].unitPrice : this.basePrice;
});

// Method to get price for quantity
productSchema.methods.getPriceForQuantity = function (quantity) {
  const tiers = this.pricing.tiers.sort((a, b) => b.minQuantity - a.minQuantity);
  const tier = tiers.find((t) => quantity >= t.minQuantity) || tiers[tiers.length - 1];
  return tier ? tier.unitPrice : this.basePrice;
};

// Method to calculate total price including waste and labor
productSchema.methods.calculateTotalPrice = function (quantity, includeWaste = true, includeLaborEstimate = false) {
  let totalQuantity = quantity;
  if (includeWaste) {
    totalQuantity = quantity * (1 + this.pricing.wasteFactor);
  }

  const unitPrice = this.getPriceForQuantity(totalQuantity);
  let total = totalQuantity * unitPrice;

  if (includeLaborEstimate) {
    total *= this.pricing.laborCostMultiplier;
  }

  return {
    unitPrice,
    quantity: totalQuantity,
    subtotal: totalQuantity * unitPrice,
    laborEstimate: includeLaborEstimate ? (totalQuantity * unitPrice * (this.pricing.laborCostMultiplier - 1)) : 0,
    total
  };
};

// Method to increment analytics
productSchema.methods.incrementAnalytics = function (field) {
  return this.updateOne({ $inc: { [`analytics.${field}`]: 1 } });
};

module.exports = mongoose.model('Product', productSchema);
