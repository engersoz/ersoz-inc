# ERSOZ INC Platform - Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Prerequisites

Ensure you have the following installed:
- **Node.js** v18 or higher
- **MongoDB** v5 or higher (local or MongoDB Atlas)
- **npm** v8 or higher
- **Git**

### Step 2: Environment Configuration

#### Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your actual values:

```env
# Generate secrets with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_SECRET=<your-generated-secret-here>
ENCRYPTION_KEY=<your-generated-key-here>
MONGODB_URI=mongodb://localhost:27017/ersoz_platform

# Optional for full functionality:
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

#### Frontend Environment

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Start Development Servers

#### Terminal 1 - Backend

```bash
cd server
npm run dev
```

Backend will run on http://localhost:5000

#### Terminal 2 - Frontend

```bash
cd client
npm start
```

Frontend will run on http://localhost:3000

### Step 5: Database Initialization

MongoDB will automatically create collections on first use. No manual setup needed.

Optional: Create initial admin user via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@ersozinc.com",
    "password": "SecurePassword123!",
    "company": "ERSOZ INC",
    "role": "admin"
  }'
```

## 🧪 Running Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📊 Key Features to Test

1. **User Registration**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Browse Products**: http://localhost:3000/products
4. **Price Calculator**: http://localhost:3000/configurator
5. **Dashboard**: http://localhost:3000/dashboard (after login)

## 🔧 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (if installed locally)
mongod
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Missing Dependencies

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🌐 Production Deployment

### Backend (Node.js)

Recommended platforms:
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS EC2**: Full control
- **DigitalOcean**: Cost-effective
- **Railway**: Modern platform

### Frontend (React)

Recommended platforms:
- **Vercel**: Automatic deployments
- **Netlify**: Great for React apps
- **AWS S3 + CloudFront**: Scalable static hosting

### Database

Recommended:
- **MongoDB Atlas**: Managed MongoDB in cloud
- **AWS DocumentDB**: MongoDB-compatible

## 📝 Default Login Credentials

After creating admin user, use:
- **Email**: admin@ersozinc.com
- **Password**: (as set during registration)

## 🔒 Security Checklist for Production

- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper MongoDB authentication
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Review and update security headers

## 📚 Additional Documentation

- API Documentation: `/docs/API.md`
- Database Schema: `/docs/DATABASE.md`
- Architecture: `/docs/ARCHITECTURE.md`

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Contact: tech@ersozinc.com
