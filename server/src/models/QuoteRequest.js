const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  // Reference information
  quoteNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  configurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Configuration'
  },

  // Client information
  clientInfo: {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: {
      type: String, required: true, lowercase: true, trim: true
    },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    }
  },

  // Project details
  projectDetails: {
    name: String,
    type: { type: String, enum: ['residential', 'commercial', 'industrial'] },
    timeline: {
      startDate: Date,
      completionDate: Date,
      urgency: { type: String, enum: ['low', 'medium', 'high', 'rush'], default: 'medium' }
    },
    location: {
      address: String,
      accessRequirements: String,
      specialInstructions: String
    }
  },

  // Products requested with enhanced details
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    specifications: {
      color: String,
      size: String,
      pattern: String,
      finish: String,
      customOptions: [{
        option: String,
        value: String
      }]
    },
    quantity: {
      area: { type: Number, required: true },
      pieces: Number,
      unit: { type: String, enum: ['sqft', 'sqm', 'pieces'], default: 'sqft' }
    },
    usage: String, // Where it will be installed
    notes: String,
    // Pricing from quote (filled by sales team)
    quotedPrice: {
      unitPrice: Number,
      totalPrice: Number,
      discountPercent: Number,
      discountAmount: Number,
      finalPrice: Number
    }
  }],

  // Enhanced attachments
  attachments: [{
    url: { type: String, required: true },
    filename: String,
    originalName: String,
    fileType: { type: String, enum: ['image', 'cad', 'pdf', 'document', 'sketch'] },
    size: Number,
    description: String,
    category: { type: String, enum: ['reference', 'blueprint', 'inspiration', 'technical', 'other'] },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Enhanced status tracking
  status: {
    type: String,
    enum: ['new', 'reviewing', 'calculating', 'quote_prepared', 'quote_sent', 'negotiating', 'approved', 'rejected', 'expired', 'converted'],
    default: 'new',
    index: true
  },

  // Quote details (filled by sales team)
  quote: {
    totalAmount: Number,
    currency: { type: String, default: 'USD' },
    taxAmount: Number,
    shippingCost: Number,
    discounts: [{
      type: { type: String, enum: ['percentage', 'fixed', 'bulk', 'seasonal'] },
      value: Number,
      description: String
    }],
    terms: {
      validUntil: Date,
      paymentTerms: String,
      deliveryTime: String,
      warranty: String,
      additionalTerms: [String]
    },
    breakdown: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number
    }]
  },

  // Workflow management
  workflow: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    estimatedCompletionTime: Number, // hours
    actualCompletionTime: Number, // hours
    dueDate: Date,
    tags: [String]
  },

  // Communication history
  communications: [{
    type: { type: String, enum: ['email', 'phone', 'meeting', 'note'], required: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    subject: String,
    content: String,
    participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attachments: [String],
    timestamp: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Internal notes (not visible to client)
  internalNotes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true }
  }],

  // Follow-up tracking
  followUps: [{
    scheduledDate: Date,
    type: { type: String, enum: ['call', 'email', 'meeting'] },
    description: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Conversion tracking
  conversion: {
    convertedToOrder: { type: Boolean, default: false },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    conversionDate: Date,
    conversionValue: Number,
    lostReason: String // If not converted
  },

  // Multi-language support
  locale: {
    type: String,
    default: 'en'
  },

  // Metadata
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'referral', 'trade_show', 'advertisement'],
    default: 'website'
  },
  referralSource: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
quoteRequestSchema.index({ userId: 1, status: 1 });
quoteRequestSchema.index({ quoteNumber: 1 });
quoteRequestSchema.index({ status: 1, createdAt: -1 });
quoteRequestSchema.index({ 'workflow.assignedTo': 1, status: 1 });
quoteRequestSchema.index({ 'workflow.priority': 1, 'workflow.dueDate': 1 });
quoteRequestSchema.index({ 'clientInfo.companyName': 1 });

// Pre-save middleware to generate quote number
quoteRequestSchema.pre('save', async function (next) {
  if (this.isNew && !this.quoteNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.quoteNumber = `QTE-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Virtual for quote age in days
quoteRequestSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for total quoted amount
quoteRequestSchema.virtual('totalQuotedAmount').get(function () {
  return this.products.reduce((total, product) => total + (product.quotedPrice?.finalPrice || 0), 0);
});

// Method to calculate quote totals
quoteRequestSchema.methods.calculateQuoteTotals = function () {
  const subtotal = this.products.reduce((total, product) => total + (product.quotedPrice?.totalPrice || 0), 0);

  const totalDiscount = this.products.reduce((total, product) => total + (product.quotedPrice?.discountAmount || 0), 0);

  const finalTotal = subtotal - totalDiscount + (this.quote?.taxAmount || 0) + (this.quote?.shippingCost || 0);

  return {
    subtotal,
    totalDiscount,
    tax: this.quote?.taxAmount || 0,
    shipping: this.quote?.shippingCost || 0,
    total: finalTotal
  };
};

// Method to add communication
quoteRequestSchema.methods.addCommunication = function (communication, userId) {
  this.communications.push({
    ...communication,
    createdBy: userId,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status with automatic workflow
quoteRequestSchema.methods.updateStatus = function (newStatus, userId, note) {
  const oldStatus = this.status;
  this.status = newStatus;

  // Add internal note for status change
  if (note) {
    this.internalNotes.push({
      content: `Status changed from ${oldStatus} to ${newStatus}. Note: ${note}`,
      createdBy: userId
    });
  }

  // Set automatic follow-ups based on status
  if (newStatus === 'quote_sent') {
    this.followUps.push({
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      type: 'call',
      description: 'Follow up on sent quote',
      assignedTo: this.workflow.assignedTo || userId
    });
  }

  return this.save();
};

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
