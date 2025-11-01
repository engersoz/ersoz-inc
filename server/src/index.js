require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Initialize express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, require('./routes/auth'));
app.use(`/api/${apiVersion}/users`, require('./routes/users'));
app.use(`/api/${apiVersion}/products`, require('./routes/products'));
app.use(`/api/${apiVersion}/configurations`, require('./routes/configurations'));
app.use(`/api/${apiVersion}/quotes`, require('./routes/quotes'));
app.use(`/api/${apiVersion}/inventory`, require('./routes/inventory'));
app.use(`/api/${apiVersion}/notifications`, require('./routes/notifications'));
app.use(`/api/${apiVersion}/analytics`, require('./routes/analytics'));
app.use(`/api/${apiVersion}/uploads`, require('./routes/uploads'));

// API Documentation (Swagger)
if (process.env.NODE_ENV !== 'production') {
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ERSOZ INC Platform API',
        version: '1.0.0',
        description: 'B2B Platform API for Glass Mosaic Tiles, Murals, and Ceramic Tiles Distribution',
        contact: {
          name: 'ERSOZ INC',
          email: 'support@ersozinc.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}/api/${apiVersion}`,
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    },
    apis: ['./src/routes/*.js', './src/models/*.js']
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle configurator real-time updates
  socket.on('configurator:update', (data) => {
    socket.broadcast.emit('configurator:updated', data);
  });

  // Handle quote updates
  socket.on('quote:update', (data) => {
    io.to(`user:${data.userId}`).emit('quote:updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 ERSOZ INC Platform Server Started
📍 Environment: ${process.env.NODE_ENV}
🌐 Server running on port ${PORT}
📚 API Docs: http://localhost:${PORT}/api/docs
💾 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
  `);
});

module.exports = app;
