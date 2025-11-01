# 🚀 START ERSOZ INC PLATFORM

## ✅ QUICK START - 2 TERMINALS NEEDED

### Terminal 1: Backend Server

```bash
cd /project/workspace/ersoz-inc-platform/server
npm start
```

**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📡 API endpoints: http://localhost:5000/api/v1
```

---

### Terminal 2: Frontend Server

```bash
cd /project/workspace/ersoz-inc-platform/client
npm run dev
```

**Expected output:**
```
VITE ready in XXXms
➜ Local: http://localhost:3000/
```

---

## 🔐 ADMIN LOGIN CREDENTIALS

Once both servers are running, open your browser:

### **LOGIN URL:** http://localhost:3000/login

```
📧 Email:    admin@ersozinc.com
🔑 Password: Admin@123456
👤 Role:     Administrator
```

---

## 📍 AVAILABLE URLS

### Frontend (React + Vite)
- **Homepage:** http://localhost:3000/
- **Products:** http://localhost:3000/products
- **Login:** http://localhost:3000/login

### Backend API (Express.js)
- **Health Check:** http://localhost:5000/api/v1/health
- **Auth Login:** http://localhost:5000/api/v1/auth/login
- **Products:** http://localhost:5000/api/v1/products
- **Users:** http://localhost:5000/api/v1/users

---

## 🔧 TROUBLESHOOTING

### Backend won't start?

```bash
# Check if .env exists
ls -la /project/workspace/ersoz-inc-platform/server/.env

# Check MongoDB connection
cd /project/workspace/ersoz-inc-platform/server
node -e "require('dotenv').config(); console.log('MongoDB:', process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing')"

# Check if port 5000 is already in use
lsof -ti:5000 | xargs kill -9  # Kill any process on port 5000
```

### Frontend won't start?

```bash
# Reinstall dependencies
cd /project/workspace/ersoz-inc-platform/client
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is already in use
lsof -ti:3000 | xargs kill -9  # Kill any process on port 3000
```

### Can't login?

```bash
# Recreate admin user
cd /project/workspace/ersoz-inc-platform/server
node src/scripts/createAdminUser.js
```

---

## 📊 WHAT YOU CAN DO

### As Admin User:
✅ View all products  
✅ Manage users (create, edit, delete)  
✅ View and manage quotes  
✅ Access inventory management  
✅ View analytics dashboard  
✅ Configure system settings  
✅ Manage notifications  

---

## 🎯 NEXT STEPS

1. **Start both servers** (backend + frontend)
2. **Open browser:** http://localhost:3000
3. **Login** with admin credentials
4. **Explore the platform!**

---

## 🆘 NEED HELP?

If servers don't start, run this diagnostic:

```bash
# Check backend status
cd /project/workspace/ersoz-inc-platform/server
npm run dev 2>&1 | head -20

# Check frontend status  
cd /project/workspace/ersoz-inc-platform/client
npm run dev 2>&1 | head -20
```

Copy any error messages and let me know!

---

## 📝 MANUAL START (Alternative)

If npm scripts don't work:

### Backend:
```bash
cd /project/workspace/ersoz-inc-platform/server
node src/server.js
```

### Frontend:
```bash
cd /project/workspace/ersoz-inc-platform/client
npx vite
```

---

**Ready to go! Start both servers and visit http://localhost:3000** 🚀
