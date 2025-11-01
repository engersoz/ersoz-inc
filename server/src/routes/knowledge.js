const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Knowledge Base Article Schema (in-memory for now - would be MongoDB in production)
const articles = [
  {
    id: '1',
    title: 'Glass Mosaic Installation Guide',
    category: 'installation',
    tags: ['glass', 'mosaic', 'installation', 'guide'],
    content: `
      # Glass Mosaic Installation Guide
      
      ## Tools Required
      - Trowel and notched trowel
      - Tile spacers
      - Rubber float
      - Sponge and bucket
      - Level
      - Tile cutter or wet saw
      
      ## Step-by-Step Installation
      
      ### 1. Surface Preparation
      Ensure the surface is clean, dry, and level. Remove any existing adhesive or debris.
      
      ### 2. Adhesive Application
      Use a high-quality tile adhesive suitable for glass mosaics. Apply with a notched trowel at a 45-degree angle.
      
      ### 3. Tile Placement
      Press tiles firmly into place, ensuring even spacing. Use tile spacers for consistent gaps.
      
      ### 4. Grouting
      After 24 hours, apply grout diagonally across tiles. Clean excess grout immediately with damp sponge.
      
      ### 5. Final Cleaning
      Polish with clean cloth once grout has cured (24-48 hours).
    `,
    lastUpdated: new Date('2024-01-15'),
    author: 'ERSOZ Technical Team',
    views: 1250,
    helpful: 45,
    notHelpful: 3
  },
  {
    id: '2',
    title: 'How to Calculate Tile Requirements',
    category: 'planning',
    tags: ['calculation', 'planning', 'quantity', 'ordering'],
    content: `
      # How to Calculate Tile Requirements
      
      ## Basic Formula
      Room Area = Length × Width
      
      ## Add Waste Factor
      - Standard installations: Add 10-15%
      - Complex patterns: Add 15-20%
      - Diagonal installations: Add 20-25%
      
      ## Example Calculation
      Room: 10ft × 12ft = 120 sq ft
      With 15% waste: 120 × 1.15 = 138 sq ft needed
      
      ## Special Considerations
      - Account for cuts around fixtures
      - Consider pattern alignment
      - Order extra for future repairs
    `,
    lastUpdated: new Date('2024-01-10'),
    author: 'Sales Team',
    views: 890,
    helpful: 32,
    notHelpful: 1
  },
  {
    id: '3',
    title: 'Maintenance and Care Instructions',
    category: 'maintenance',
    tags: ['cleaning', 'maintenance', 'care', 'longevity'],
    content: `
      # Tile Maintenance and Care
      
      ## Daily Cleaning
      - Use mild soap and water
      - Avoid abrasive cleaners
      - Dry with soft cloth
      
      ## Deep Cleaning
      - Use pH-neutral cleaners
      - For stubborn stains, use baking soda paste
      - Never use acidic cleaners on natural stone
      
      ## Grout Maintenance
      - Seal grout lines annually
      - Clean spills immediately
      - Replace damaged grout promptly
    `,
    lastUpdated: new Date('2024-01-08'),
    author: 'Customer Service',
    views: 650,
    helpful: 28,
    notHelpful: 2
  }
];

// Simple chatbot responses (would integrate with AI service in production)
const chatbotResponses = {
  greeting: [
    "Hello! I'm here to help you with any questions about our tiles and mosaics. What can I assist you with today?",
    "Hi there! How can I help you find the perfect tiles for your project?",
    "Welcome to ERSOZ INC! I'm your virtual assistant. What would you like to know?"
  ],
  installation: [
    "For installation guidance, I recommend checking our Glass Mosaic Installation Guide. Would you like me to find specific installation information for your tile type?",
    "Installation varies by tile type. What kind of tiles are you planning to install? Glass mosaics, ceramic, or natural stone?"
  ],
  pricing: [
    "For accurate pricing, I can help you use our Price Calculator. What's the total area you need to tile?",
    "Pricing depends on the tile type, quantity, and your location. Would you like me to connect you with a sales representative?"
  ],
  shipping: [
    "We offer shipping across Turkey and internationally. Delivery time typically ranges from 3-7 business days depending on your location.",
    "Shipping costs are calculated based on weight and destination. Large orders may qualify for free shipping."
  ],
  samples: [
    "Yes, we offer samples for most of our tile collections. You can request up to 5 samples per order.",
    "Sample orders typically arrive within 3-5 business days and help you see the actual colors and textures."
  ]
};

/**
 * @swagger
 * /knowledge/articles:
 *   get:
 *     summary: Get knowledge base articles
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 */
router.get('/articles', async (req, res, next) => {
  try {
    let filteredArticles = [...articles];

    // Filter by category
    if (req.query.category) {
      filteredArticles = filteredArticles.filter(article => 
        article.category === req.query.category
      );
    }

    // Search in title and content
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by tags
    if (req.query.tags) {
      const requestedTags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredArticles = filteredArticles.filter(article =>
        requestedTags.some(tag => 
          article.tags.some(articleTag => articleTag.toLowerCase().includes(tag))
        )
      );
    }

    // Sort by relevance (views and helpfulness)
    filteredArticles.sort((a, b) => {
      const scoreA = a.views + (a.helpful * 10) - (a.notHelpful * 5);
      const scoreB = b.views + (b.helpful * 10) - (b.notHelpful * 5);
      return scoreB - scoreA;
    });

    // Get categories and tags for filters
    const categories = [...new Set(articles.map(article => article.category))];
    const allTags = [...new Set(articles.flatMap(article => article.tags))];

    res.json({
      success: true,
      data: {
        articles: filteredArticles.map(article => ({
          ...article,
          content: req.query.preview === 'true' 
            ? article.content.substring(0, 200) + '...'
            : article.content
        })),
        filters: {
          categories,
          tags: allTags
        },
        total: filteredArticles.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /knowledge/articles/{id}:
 *   get:
 *     summary: Get single knowledge base article
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *       404:
 *         description: Article not found
 */
router.get('/articles/:id', async (req, res, next) => {
  try {
    const article = articles.find(a => a.id === req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article not found' }
      });
    }

    // Increment view count (would be persisted in database)
    article.views++;

    // Get related articles
    const relatedArticles = articles
      .filter(a => 
        a.id !== article.id && 
        (a.category === article.category || 
         a.tags.some(tag => article.tags.includes(tag)))
      )
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        article,
        relatedArticles: relatedArticles.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          tags: a.tags
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /knowledge/articles/{id}/feedback:
 *   post:
 *     summary: Submit feedback for an article
 *     tags: [Knowledge Base]
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
 *               - helpful
 *             properties:
 *               helpful:
 *                 type: boolean
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 */
router.post('/articles/:id/feedback', [
  body('helpful').isBoolean().withMessage('Helpful must be true or false')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const article = articles.find(a => a.id === req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article not found' }
      });
    }

    // Update feedback counts
    if (req.body.helpful) {
      article.helpful++;
    } else {
      article.notHelpful++;
    }

    // In production, would save feedback with user info to database
    res.json({
      success: true,
      data: { message: 'Thank you for your feedback!' }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /knowledge/chatbot:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [Knowledge Base]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Bot response generated successfully
 */
router.post('/chatbot', [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const userMessage = req.body.message.toLowerCase();
    const context = req.body.context || {};
    
    let botResponse = '';
    let suggestedActions = [];
    let relatedArticles = [];

    // Simple keyword-based responses (would use AI/NLP in production)
    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      botResponse = chatbotResponses.greeting[Math.floor(Math.random() * chatbotResponses.greeting.length)];
      suggestedActions = [
        { text: 'Browse Products', action: 'navigate', target: '/products' },
        { text: 'Calculate Price', action: 'navigate', target: '/configurator' },
        { text: 'Installation Guide', action: 'search', query: 'installation' }
      ];
    } else if (userMessage.includes('install') || userMessage.includes('installation')) {
      botResponse = chatbotResponses.installation[Math.floor(Math.random() * chatbotResponses.installation.length)];
      relatedArticles = articles.filter(a => a.category === 'installation').slice(0, 2);
      suggestedActions = [
        { text: 'View Installation Guide', action: 'article', articleId: '1' },
        { text: 'Contact Support', action: 'contact', type: 'support' }
      ];
    } else if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('pricing')) {
      botResponse = chatbotResponses.pricing[Math.floor(Math.random() * chatbotResponses.pricing.length)];
      suggestedActions = [
        { text: 'Use Price Calculator', action: 'navigate', target: '/configurator' },
        { text: 'Request Quote', action: 'navigate', target: '/quote' },
        { text: 'Contact Sales', action: 'contact', type: 'sales' }
      ];
    } else if (userMessage.includes('shipping') || userMessage.includes('delivery')) {
      botResponse = chatbotResponses.shipping[Math.floor(Math.random() * chatbotResponses.shipping.length)];
    } else if (userMessage.includes('sample') || userMessage.includes('samples')) {
      botResponse = chatbotResponses.samples[Math.floor(Math.random() * chatbotResponses.samples.length)];
      suggestedActions = [
        { text: 'Request Samples', action: 'navigate', target: '/samples' },
        { text: 'View Catalog', action: 'navigate', target: '/products' }
      ];
    } else if (userMessage.includes('maintenance') || userMessage.includes('clean') || userMessage.includes('care')) {
      botResponse = "I can help you with tile maintenance and care. Our maintenance guide covers daily cleaning, deep cleaning, and grout care.";
      relatedArticles = articles.filter(a => a.category === 'maintenance').slice(0, 2);
      suggestedActions = [
        { text: 'View Maintenance Guide', action: 'article', articleId: '3' }
      ];
    } else if (userMessage.includes('calculate') || userMessage.includes('how much') || userMessage.includes('quantity')) {
      botResponse = "I can help you calculate how much tile you need. The basic formula is room length × width, plus 10-15% for waste.";
      relatedArticles = articles.filter(a => a.title.includes('Calculate')).slice(0, 1);
      suggestedActions = [
        { text: 'Use Calculator', action: 'navigate', target: '/configurator' },
        { text: 'View Guide', action: 'article', articleId: '2' }
      ];
    } else {
      // General search in articles
      const searchResults = articles.filter(article =>
        article.title.toLowerCase().includes(userMessage) ||
        article.content.toLowerCase().includes(userMessage) ||
        article.tags.some(tag => tag.toLowerCase().includes(userMessage))
      );

      if (searchResults.length > 0) {
        botResponse = `I found ${searchResults.length} article(s) related to your question. Here are the most relevant ones:`;
        relatedArticles = searchResults.slice(0, 2);
      } else {
        botResponse = "I'm not sure I understand your question. Could you please rephrase it or try asking about installation, pricing, maintenance, or tile calculations? You can also contact our support team for personalized help.";
        suggestedActions = [
          { text: 'Contact Support', action: 'contact', type: 'support' },
          { text: 'Browse FAQ', action: 'search', query: 'frequently asked' },
          { text: 'View All Articles', action: 'navigate', target: '/knowledge' }
        ];
      }
    }

    res.json({
      success: true,
      data: {
        response: botResponse,
        suggestedActions,
        relatedArticles: relatedArticles.map(article => ({
          id: article.id,
          title: article.title,
          category: article.category
        })),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /knowledge/search:
 *   get:
 *     summary: Search knowledge base with advanced filters
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const category = req.query.category;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

    if (!query) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
    }

    let results = articles.filter(article => {
      const matchesQuery = article.title.toLowerCase().includes(query) ||
                          article.content.toLowerCase().includes(query) ||
                          article.tags.some(tag => tag.toLowerCase().includes(query));
      
      const matchesCategory = !category || article.category === category;
      
      return matchesQuery && matchesCategory;
    });

    // Score results by relevance
    results = results.map(article => {
      let score = 0;
      
      // Title match is worth more
      if (article.title.toLowerCase().includes(query)) score += 10;
      
      // Tag match
      if (article.tags.some(tag => tag.toLowerCase().includes(query))) score += 5;
      
      // Content match
      const contentMatches = (article.content.toLowerCase().match(new RegExp(query, 'g')) || []).length;
      score += contentMatches;
      
      // Popularity bonus
      score += Math.log(article.views + 1) + (article.helpful * 0.1);
      
      return { ...article, relevanceScore: score };
    });

    // Sort by relevance and limit
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    results = results.slice(0, limit);

    res.json({
      success: true,
      data: {
        results: results.map(({ relevanceScore, ...article }) => ({
          ...article,
          content: article.content.substring(0, 200) + '...'
        })),
        total: results.length,
        query,
        category: category || null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /knowledge/stats:
 *   get:
 *     summary: Get knowledge base statistics (admin only)
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', authorize('admin'), async (req, res, next) => {
  try {
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
    const totalFeedback = articles.reduce((sum, article) => sum + article.helpful + article.notHelpful, 0);
    const averageHelpfulness = totalFeedback > 0 
      ? (articles.reduce((sum, article) => sum + article.helpful, 0) / totalFeedback) * 100 
      : 0;

    const categoryStats = articles.reduce((stats, article) => {
      stats[article.category] = (stats[article.category] || 0) + 1;
      return stats;
    }, {});

    const mostViewedArticles = [...articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(article => ({
        id: article.id,
        title: article.title,
        views: article.views,
        helpful: article.helpful
      }));

    res.json({
      success: true,
      data: {
        totalArticles,
        totalViews,
        totalFeedback,
        averageHelpfulness: Math.round(averageHelpfulness),
        categoryStats,
        mostViewedArticles,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
