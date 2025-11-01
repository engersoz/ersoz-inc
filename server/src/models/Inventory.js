const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },

  // Warehouse information
  warehouse: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true
    },
    name: String,
    location: String
  },

  // Stock levels
  stockLevels: {
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0
    },
    inTransitStock: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Thresholds and alerts
  thresholds: {
    reorderPoint: {
      type: Number,
      required: true,
      min: 0
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0
    },
    maximumStock: Number
  },

  // Cost information
  costInfo: {
    lastCost: Number,
    averageCost: Number,
    standardCost: Number,
    currency: { type: String, default: 'USD' }
  },

  // Location details within warehouse
  locationDetails: {
    aisle: String,
    shelf: String,
    bin: String,
    level: String
  },

  // Enhanced tracking
  tracking: {
    lastStockCheck: Date,
    lastMovement: Date,
    stockCheckFrequency: { type: Number, default: 30 }, // days
    movements: [{
      type: { type: String, enum: ['in', 'out', 'adjustment', 'transfer'], required: true },
      quantity: { type: Number, required: true },
      reason: String,
      reference: String, // Order ID, Transfer ID, etc.
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      notes: String
    }]
  },

  // Alerts and notifications
  alerts: [{
    type: { type: String, enum: ['low_stock', 'out_of_stock', 'overstock', 'reorder'], required: true },
    triggered: { type: Boolean, default: false },
    triggeredAt: Date,
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: Date,
    message: String
  }],

  // Supplier information
  suppliers: [{
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: String,
    supplierSKU: String,
    leadTime: Number, // days
    minimumOrderQuantity: Number,
    lastOrderDate: Date,
    isPrimary: { type: Boolean, default: false }
  }],

  // Status and configuration
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'seasonal'],
    default: 'active',
    index: true
  },

  // Multi-location tracking for future expansion
  crossDockingInfo: {
    allowCrossDocking: { type: Boolean, default: false },
    transferInTransit: [{
      fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
      toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
      quantity: Number,
      transferDate: Date,
      expectedArrival: Date,
      status: { type: String, enum: ['pending', 'in_transit', 'delivered'], default: 'pending' }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
inventorySchema.index({ productId: 1, 'warehouse.id': 1 }, { unique: true });
inventorySchema.index({ 'stockLevels.availableStock': 1, status: 1 });
inventorySchema.index({ 'thresholds.reorderPoint': 1, 'stockLevels.availableStock': 1 });
inventorySchema.index({ updatedAt: -1 });

// Virtual for available stock calculation
inventorySchema.virtual('calculatedAvailableStock').get(function () {
  return Math.max(0, this.stockLevels.currentStock - this.stockLevels.reservedStock);
});

// Virtual for reorder needed
inventorySchema.virtual('needsReorder').get(function () {
  return this.calculatedAvailableStock <= this.thresholds.reorderPoint;
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function () {
  const available = this.calculatedAvailableStock;
  if (available === 0) return 'out_of_stock';
  if (available <= this.thresholds.minimumStock) return 'low_stock';
  if (this.thresholds.maximumStock && available >= this.thresholds.maximumStock) return 'overstock';
  return 'in_stock';
});

// Pre-save middleware to calculate available stock
inventorySchema.pre('save', function (next) {
  this.stockLevels.availableStock = this.calculatedAvailableStock;
  next();
});

// Method to reserve stock
inventorySchema.methods.reserveStock = function (quantity, reference = '') {
  if (quantity > this.calculatedAvailableStock) {
    throw new Error('Insufficient stock available for reservation');
  }

  this.stockLevels.reservedStock += quantity;
  this.tracking.movements.push({
    type: 'out',
    quantity: -quantity,
    reason: 'reservation',
    reference,
    timestamp: new Date()
  });

  return this.save();
};

// Method to release reserved stock
inventorySchema.methods.releaseStock = function (quantity, reference = '') {
  if (quantity > this.stockLevels.reservedStock) {
    throw new Error('Cannot release more stock than reserved');
  }

  this.stockLevels.reservedStock -= quantity;
  this.tracking.movements.push({
    type: 'in',
    quantity,
    reason: 'reservation_release',
    reference,
    timestamp: new Date()
  });

  return this.save();
};

// Method to adjust stock
inventorySchema.methods.adjustStock = function (newQuantity, reason, performedBy, reference = '') {
  const oldQuantity = this.stockLevels.currentStock;
  const difference = newQuantity - oldQuantity;

  this.stockLevels.currentStock = newQuantity;
  this.tracking.lastMovement = new Date();

  this.tracking.movements.push({
    type: 'adjustment',
    quantity: difference,
    reason,
    reference,
    performedBy,
    timestamp: new Date(),
    notes: `Stock adjusted from ${oldQuantity} to ${newQuantity}`
  });

  return this.save();
};

// Method to check and create alerts
inventorySchema.methods.checkAlerts = function () {
  const alerts = [];
  const available = this.calculatedAvailableStock;

  // Out of stock alert
  if (available === 0) {
    alerts.push({
      type: 'out_of_stock',
      message: 'Product is out of stock',
      triggered: true,
      triggeredAt: new Date()
    });
  }
  // Low stock alert
  else if (available <= this.thresholds.minimumStock) {
    alerts.push({
      type: 'low_stock',
      message: `Stock level (${available}) is below minimum threshold (${this.thresholds.minimumStock})`,
      triggered: true,
      triggeredAt: new Date()
    });
  }

  // Reorder alert
  if (this.needsReorder) {
    alerts.push({
      type: 'reorder',
      message: `Stock level (${available}) has reached reorder point (${this.thresholds.reorderPoint})`,
      triggered: true,
      triggeredAt: new Date()
    });
  }

  // Overstock alert
  if (this.thresholds.maximumStock && available >= this.thresholds.maximumStock) {
    alerts.push({
      type: 'overstock',
      message: `Stock level (${available}) exceeds maximum threshold (${this.thresholds.maximumStock})`,
      triggered: true,
      triggeredAt: new Date()
    });
  }

  // Add new alerts
  alerts.forEach((alert) => {
    const existingAlert = this.alerts.find((a) => a.type === alert.type && !a.acknowledged);
    if (!existingAlert) {
      this.alerts.push(alert);
    }
  });

  return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema);
