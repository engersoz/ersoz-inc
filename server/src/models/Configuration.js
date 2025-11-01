const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  projectName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  // Enhanced project details
  projectInfo: {
    areaDetails: {
      totalArea: { type: Number, required: true }, // in sq ft or sq m
      unit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' },
      rooms: [{
        name: String,
        area: Number,
        usage: { type: String, enum: ['kitchen', 'bathroom', 'pool', 'floor', 'wall', 'shower', 'backsplash'] }
      }]
    },
    location: {
      type: { type: String, enum: ['interior', 'exterior'] },
      environment: { type: String, enum: ['dry', 'wet', 'submerged'] }
    }
  },
  // Product selections with enhanced pricing
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    selectedOptions: {
      color: String,
      size: String,
      pattern: String,
      finish: String,
      customizations: [{
        type: String,
        value: String,
        priceModifier: Number
      }]
    },
    // Enhanced quantity and pricing
    quantity: {
      area: { type: Number, required: true }, // Area to be covered
      pieces: Number, // Number of pieces/tiles
      wastePercentage: { type: Number, default: 10 }
    },
    pricing: {
      unitPrice: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      wasteAmount: Number,
      customizationCost: Number,
      totalCost: { type: Number, required: true }
    },
    notes: String
  }],
  // File uploads with metadata
  uploadedFiles: [{
    url: { type: String, required: true },
    filename: String,
    originalName: String,
    fileType: { type: String, enum: ['image', 'cad', 'sketch', 'document'] },
    size: Number, // in bytes
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }],
  // Enhanced calculation results
  calculations: {
    totalArea: Number,
    totalCost: { type: Number, default: 0 },
    breakdown: {
      materials: Number,
      waste: Number,
      customizations: Number,
      laborEstimate: Number
    },
    currency: { type: String, default: 'USD' },
    lastCalculatedAt: { type: Date, default: Date.now }
  },
  // Project preferences
  preferences: {
    includeLaborEstimate: { type: Boolean, default: false },
    includeWasteFactor: { type: Boolean, default: true },
    preferredUnits: { type: String, enum: ['metric', 'imperial'], default: 'imperial' }
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  // Enhanced status tracking
  status: {
    type: String,
    enum: ['draft', 'calculated', 'saved', 'quote_requested', 'quote_received', 'approved', 'ordered', 'archived'],
    default: 'draft',
    index: true
  },
  // Workflow tracking
  workflow: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: Date,
    tags: [String]
  },
  // Version control for changes
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    versionNumber: Number,
    data: mongoose.Schema.Types.Mixed,
    createdAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  // Integration with quotes
  relatedQuotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuoteRequest'
  }],
  // Client feedback
  clientFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    submittedAt: Date
  },
  locale: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
configurationSchema.index({ userId: 1, status: 1 });
configurationSchema.index({ status: 1, createdAt: -1 });
configurationSchema.index({ 'workflow.assignedTo': 1 });
configurationSchema.index({ 'workflow.dueDate': 1 });

// Virtual for total cost calculation
configurationSchema.virtual('totalCost').get(function () {
  return this.products.reduce((total, product) => total + product.pricing.totalCost, 0);
});

// Method to calculate project totals
configurationSchema.methods.calculateTotals = function () {
  let totalArea = 0;
  let totalCost = 0;
  let materialsCost = 0;
  let wasteCost = 0;
  let customizationsCost = 0;

  this.products.forEach((product) => {
    totalArea += product.quantity.area;
    totalCost += product.pricing.totalCost;
    materialsCost += product.pricing.subtotal;
    wasteCost += product.pricing.wasteAmount || 0;
    customizationsCost += product.pricing.customizationCost || 0;
  });

  this.calculations = {
    totalArea,
    totalCost,
    breakdown: {
      materials: materialsCost,
      waste: wasteCost,
      customizations: customizationsCost,
      laborEstimate: this.preferences.includeLaborEstimate ? materialsCost * 0.3 : 0
    },
    currency: this.calculations?.currency || 'USD',
    lastCalculatedAt: new Date()
  };

  return this.calculations;
};

// Method to create new version
configurationSchema.methods.createVersion = function (userId) {
  if (!this.previousVersions) this.previousVersions = [];

  this.previousVersions.push({
    versionNumber: this.version,
    data: this.toObject(),
    createdAt: new Date(),
    createdBy: userId
  });

  this.version += 1;
  return this.version;
};

// Method to validate configuration
configurationSchema.methods.validate = function () {
  const errors = [];

  if (!this.products || this.products.length === 0) {
    errors.push('At least one product must be selected');
  }

  if (!this.projectInfo?.areaDetails?.totalArea) {
    errors.push('Total area must be specified');
  }

  this.products.forEach((product, index) => {
    if (!product.quantity?.area) {
      errors.push(`Product ${index + 1}: Area must be specified`);
    }
    if (!product.pricing?.unitPrice) {
      errors.push(`Product ${index + 1}: Unit price must be calculated`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = mongoose.model('Configuration', configurationSchema);
