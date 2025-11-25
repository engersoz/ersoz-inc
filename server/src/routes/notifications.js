const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Email transporter setup (only if SMTP is configured)
let emailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Twilio client setup
const twilioClient = process.env.TWILIO_ACCOUNT_SID 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Notification templates
const templates = {
  quote_created: {
    email: {
      subject: 'New Quote Request #{{quoteNumber}}',
      html: `
        <h2>New Quote Request</h2>
        <p>Hello {{name}},</p>
        <p>A new quote request #{{quoteNumber}} has been created for {{companyName}}.</p>
        <p><strong>Project:</strong> {{projectName}}</p>
        <p><strong>Total Area:</strong> {{totalArea}} sq ft</p>
        <p><a href="{{dashboardUrl}}/quotes/{{quoteId}}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Quote Request</a></p>
        <p>Best regards,<br>ERSOZ INC Team</p>
      `
    },
    sms: 'New quote request #{{quoteNumber}} created. View at: {{shortUrl}}'
  },
  quote_status_updated: {
    email: {
      subject: 'Quote #{{quoteNumber}} Status Updated',
      html: `
        <h2>Quote Status Updated</h2>
        <p>Hello {{name}},</p>
        <p>Your quote request #{{quoteNumber}} status has been updated to: <strong>{{status}}</strong></p>
        {{#if message}}<p>{{message}}</p>{{/if}}
        <p><a href="{{dashboardUrl}}/quotes/{{quoteId}}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Quote</a></p>
        <p>Best regards,<br>ERSOZ INC Team</p>
      `
    },
    sms: 'Quote #{{quoteNumber}} status updated to {{status}}. View: {{shortUrl}}'
  },
  inventory_alert: {
    email: {
      subject: 'Inventory Alert - {{productName}}',
      html: `
        <h2 style="color: #ef4444;">Inventory Alert</h2>
        <p>Hello {{name}},</p>
        <p><strong>Product:</strong> {{productName}} ({{sku}})</p>
        <p><strong>Warehouse:</strong> {{warehouseName}}</p>
        <p><strong>Alert:</strong> {{alertMessage}}</p>
        <p><strong>Current Stock:</strong> {{currentStock}}</p>
        <p><strong>Available Stock:</strong> {{availableStock}}</p>
        <p><a href="{{dashboardUrl}}/inventory/{{inventoryId}}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Manage Inventory</a></p>
        <p>Best regards,<br>ERSOZ INC Team</p>
      `
    }
  },
  welcome: {
    email: {
      subject: 'Welcome to ERSOZ INC Platform',
      html: `
        <h2>Welcome to ERSOZ INC!</h2>
        <p>Hello {{name}},</p>
        <p>Welcome to the ERSOZ INC B2B platform. Your account has been created successfully.</p>
        <p><strong>Company:</strong> {{company}}</p>
        <p><strong>Role:</strong> {{role}}</p>
        <p>Get started by exploring our premium collection of tiles and mosaics:</p>
        <ul>
          <li><a href="{{platformUrl}}/products">Browse Products</a></li>
          <li><a href="{{platformUrl}}/configurator">Use Price Calculator</a></li>
          <li><a href="{{platformUrl}}/dashboard">Visit Dashboard</a></li>
        </ul>
        <p><a href="{{platformUrl}}/dashboard" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Get Started</a></p>
        <p>Best regards,<br>ERSOZ INC Team</p>
      `
    }
  }
};

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Send notification (admin/sales only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - template
 *               - data
 *             properties:
 *               recipients:
 *                 type: array
 *               template:
 *                 type: string
 *               channels:
 *                 type: array
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post('/send', authorize('admin', 'sales'), [
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('template').notEmpty().withMessage('Template is required'),
  body('data').isObject().withMessage('Template data is required'),
  body('channels').optional().isArray().withMessage('Channels must be an array')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { recipients, template: templateName, data, channels = ['email'] } = req.body;
    const template = templates[templateName];

    if (!template) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid template name' }
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      details: []
    };

    // Process each recipient
    for (const recipient of recipients) {
      try {
        const recipientData = { ...data, ...recipient };
        
        // Send email if requested and template exists
        if (channels.includes('email') && template.email && recipient.email && emailTransporter) {
          const subject = renderTemplate(template.email.subject, recipientData);
          const html = renderTemplate(template.email.html, recipientData);
          
          await emailTransporter.sendMail({
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to: recipient.email,
            subject,
            html
          });
          
          results.sent++;
          results.details.push({
            recipient: recipient.email,
            channel: 'email',
            status: 'sent'
          });
        }

        // Send SMS if requested and template exists
        if (channels.includes('sms') && template.sms && recipient.phone && twilioClient) {
          const message = renderTemplate(template.sms, recipientData);
          
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: recipient.phone
          });
          
          results.sent++;
          results.details.push({
            recipient: recipient.phone,
            channel: 'sms',
            status: 'sent'
          });
        }

        // Send push notification if requested
        if (channels.includes('push') && recipient.userId && req.io) {
          req.io.to(`user:${recipient.userId}`).emit('notification', {
            type: templateName,
            title: renderTemplate(template.email?.subject || templateName, recipientData),
            message: renderTemplate(template.sms || 'You have a new notification', recipientData),
            data: recipientData
          });
          
          results.sent++;
          results.details.push({
            recipient: recipient.userId,
            channel: 'push',
            status: 'sent'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          recipient: recipient.email || recipient.phone || recipient.userId,
          error: error.message,
          status: 'failed'
        });
      }
    }

    res.json({
      success: true,
      data: {
        message: `Sent ${results.sent} notifications, ${results.failed} failed`,
        results
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/templates:
 *   get:
 *     summary: Get available notification templates
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get('/templates', authorize('admin', 'sales'), async (req, res, next) => {
  try {
    const templateList = Object.keys(templates).map(name => ({
      name,
      channels: Object.keys(templates[name]),
      description: getTemplateDescription(name)
    }));

    res.json({
      success: true,
      data: { templates: templateList }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /notifications/test:
 *   post:
 *     summary: Test notification delivery (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel
 *               - recipient
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [email, sms]
 *               recipient:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test notification sent
 */
router.post('/test', authorize('admin'), [
  body('channel').isIn(['email', 'sms']).withMessage('Invalid channel'),
  body('recipient').notEmpty().withMessage('Recipient is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { channel, recipient } = req.body;

    if (channel === 'email') {
      await emailTransporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: recipient,
        subject: 'ERSOZ INC - Test Email',
        html: `
          <h2>Test Email from ERSOZ INC</h2>
          <p>This is a test email sent at ${new Date().toISOString()}</p>
          <p>If you received this email, the notification system is working correctly.</p>
          <p>Best regards,<br>ERSOZ INC Team</p>
        `
      });
    } else if (channel === 'sms' && twilioClient) {
      await twilioClient.messages.create({
        body: `ERSOZ INC Test SMS - ${new Date().toISOString()}. Notification system is working correctly.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient
      });
    }

    res.json({
      success: true,
      data: { message: `Test ${channel} sent successfully to ${recipient}` }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to render templates with data
function renderTemplate(template, data) {
  let rendered = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  return rendered;
}

// Helper function to get template descriptions
function getTemplateDescription(templateName) {
  const descriptions = {
    quote_created: 'Sent when a new quote request is created',
    quote_status_updated: 'Sent when quote status changes',
    inventory_alert: 'Sent for inventory alerts (low stock, out of stock)',
    welcome: 'Sent to new users upon registration'
  };
  return descriptions[templateName] || 'No description available';
}

// Utility functions for common notification scenarios
const notificationUtils = {
  async sendQuoteCreated(quote, assignedUser) {
    if (!assignedUser) return;
    
    const data = {
      name: assignedUser.name,
      quoteNumber: quote.quoteNumber,
      companyName: quote.clientInfo.companyName,
      projectName: quote.projectDetails?.name || 'Tile Project',
      totalArea: quote.products.reduce((sum, p) => sum + p.quantity.area, 0),
      dashboardUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      quoteId: quote._id
    };

    try {
      await this.sendNotification([{
        email: assignedUser.email,
        userId: assignedUser._id
      }], 'quote_created', data, ['email', 'push']);
    } catch (error) {
      console.error('Failed to send quote created notification:', error);
    }
  },

  async sendQuoteStatusUpdated(quote, user, message = '') {
    const data = {
      name: user.name,
      quoteNumber: quote.quoteNumber,
      status: quote.status.replace('_', ' ').toUpperCase(),
      message,
      dashboardUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      quoteId: quote._id
    };

    try {
      await this.sendNotification([{
        email: user.email,
        userId: user._id
      }], 'quote_status_updated', data, ['email', 'push']);
    } catch (error) {
      console.error('Failed to send quote status notification:', error);
    }
  },

  async sendInventoryAlert(inventory, users) {
    const productName = inventory.productId.name || 'Unknown Product';
    
    const data = {
      productName,
      sku: inventory.productId.SKU,
      warehouseName: inventory.warehouse.name,
      alertMessage: inventory.alerts.find(a => !a.acknowledged)?.message || 'Stock alert',
      currentStock: inventory.stockLevels.currentStock,
      availableStock: inventory.stockLevels.availableStock,
      dashboardUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      inventoryId: inventory._id
    };

    const recipients = users.map(user => ({
      name: user.name,
      email: user.email,
      userId: user._id,
      ...data
    }));

    try {
      await this.sendNotification(recipients, 'inventory_alert', data, ['email']);
    } catch (error) {
      console.error('Failed to send inventory alert:', error);
    }
  },

  async sendWelcome(user) {
    const data = {
      name: user.name,
      company: user.company,
      role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      platformUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    };

    try {
      await this.sendNotification([{
        email: user.email,
        userId: user._id,
        ...data
      }], 'welcome', data, ['email']);
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
    }
  }
};

// Export utilities for use in other modules
router.notificationUtils = notificationUtils;

module.exports = router;
