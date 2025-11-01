# ERSOZ INC B2B Platform

A comprehensive B2B platform for distributing Glass Mosaic Tiles, Murals, and Ceramic Tiles to construction companies, contractors, and local tile suppliers.

## Features

- **User Management & RBAC**: Multi-role access control with 2FA
- **Product Catalog**: Advanced product management with variants and media
- **Interactive Configurator**: Real-time price calculator with area input and design selection
- **Quote Management**: Complete workflow from request to approval
- **Inventory Management**: Multi-warehouse inventory tracking with alerts
- **Notifications**: Multi-channel notifications (email, SMS, push)
- **Knowledge Base**: Help articles and AI chatbot support
- **Analytics**: Sales reports and conversion tracking
- **Multi-Language**: Full internationalization support
- **Security**: GDPR/CCPA compliant with enterprise-grade security

## Architecture

- **Backend**: Node.js with Express.js and MongoDB
- **Frontend**: React with TypeScript and Tailwind CSS
- **Database**: MongoDB with optimized schemas for scalability
- **Authentication**: JWT with 2FA support
- **File Storage**: Cloud storage integration for media files
- **Real-time**: WebSocket support for live updates

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ersoz-inc-platform

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Environment Setup

Copy the environment files and configure:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Project Structure

```
ersoz-inc-platform/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── tests/              # Backend tests
│   └── package.json
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](docs/) folder:

- **[Start Application](docs/START_APPLICATION.md)** - How to run the backend and frontend servers
- **[Setup Guide](docs/SETUP.md)** - Complete installation and configuration instructions
- **[Completion Status](docs/COMPLETION_STATUS.md)** - Current project progress and features
- **[MongoDB Troubleshooting](docs/MONGODB_TROUBLESHOOTING.md)** - Database connection help

See the [docs README](docs/README.md) for a complete list of available documentation.

## API Documentation

The API documentation is available at `/api/docs` when running the development server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC License - see LICENSE file for details.