# 💻 LOCAL DEVELOPMENT WITH FACTORY BRIDGE

This guide will help you set up and work with your ERSOZ INC platform locally using Factory Bridge.

---

## 📍 CURRENT STATUS

✅ **Repository Location (Remote):** `/project/workspace/ersoz-inc-platform`  
✅ **GitHub Repository:** `https://github.com/engersoz/ersoz-inc`  
✅ **Main Branch:** Synced and up-to-date  
✅ **All Dependencies:** Installed  
✅ **Build Status:** ✅ Successful (498KB JS, 51KB CSS)  

---

## 🚀 STEP 1: CLONE TO YOUR LOCAL COMPUTER

Open Terminal/Command Prompt and run:

```bash
# Navigate to where you want to save
cd ~/Documents  # Mac/Linux
# or
cd %USERPROFILE%\Documents  # Windows

# Clone repository
git clone https://github.com/engersoz/ersoz-inc.git

# Enter directory
cd ersoz-inc
```

---

## 📦 STEP 2: INSTALL DEPENDENCIES

```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies (new terminal or cd ../client)
cd client
npm install
```

---

## ⚙️ STEP 3: CONFIGURE ENVIRONMENT FILES

### Backend Environment (`server/.env`)

Already configured in the repository with your MongoDB credentials:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://engersoz_db_user:***@ersozinc.6wnw7zk.mongodb.net/...
JWT_SECRET=0b592df77658b1a029653daa4dfe5c0e0188f54d406762749151e3a0a3d33cc9
REFRESH_TOKEN_SECRET=d53baa3d5aa4e3b83d7da005633e6e42eb3ae840c71adf907737a56543993db7
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment (`client/.env`)

Already created:

```env
VITE_API_URL=http://localhost:5000/api
```

✅ **Both files are ready to use!**

---

## 🏃 STEP 4: RUN LOCALLY

### Option A: Run in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Option B: Run from Root (if package.json has scripts)

```bash
# From root directory
npm start
```

---

## 🌐 ACCESS YOUR PLATFORM

Once running:

- **Frontend:** http://localhost:5173 (or 5174)
- **Backend API:** http://localhost:5000
- **Backend Health:** http://localhost:5000/health

---

## 🌉 STEP 5: VERIFY FACTORY BRIDGE CONNECTION

After cloning to your computer, Factory Bridge should automatically detect your repository.

**To verify:**

1. Check Factory Bridge status indicator
2. The local path should show your cloned repository
3. Factory AI can now make changes directly to your local files

**Test command in your terminal:**
```bash
cd ~/Documents/ersoz-inc  # Your local path
pwd
git status
```

---

## 🎯 HOW TO WORK WITH FACTORY AI

Once Factory Bridge is connected to your local repository:

### **You Can Ask Factory AI To:**

1. ✅ **Add new features**
   - "Add a contact form to the homepage"
   - "Create a new product category page"

2. ✅ **Fix bugs**
   - "Fix the login button alignment"
   - "Resolve the TypeScript error in HomePage"

3. ✅ **Run commands**
   - "Test the build"
   - "Run the development server"
   - "Install a new package"

4. ✅ **Code reviews**
   - "Review my changes in ProductPage"
   - "Check for security issues"

### **All Changes Will:**
- ✅ Save directly to your local files
- ✅ Be visible in your code editor immediately
- ✅ Can be committed and pushed by you whenever ready

---

## 📂 PROJECT STRUCTURE

```
ersoz-inc/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # All Pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── CertificatesPage.tsx  ⭐ NEW
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── admin/      # Admin Pages
│   │   ├── store/          # State Management (Zustand)
│   │   ├── utils/          # API Client & Utilities
│   │   └── App.tsx         # Main App Router
│   ├── public/             # Static Assets
│   ├── .env                # Local development API URL
│   └── package.json
│
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # API Logic
│   │   ├── models/         # MongoDB Models
│   │   ├── routes/         # API Routes
│   │   ├── middleware/     # Auth & Validation
│   │   ├── scripts/        # Seeding Scripts
│   │   │   └── seedProducts.js  # 10 Mossaica Products
│   │   └── server.js       # Main Server
│   ├── .env                # MongoDB & Secrets
│   └── package.json
│
└── docs/                   # Documentation
```

---

## 🛠️ USEFUL COMMANDS

### Development
```bash
# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev

# Run both (if configured)
npm start
```

### Building
```bash
# Build frontend
cd client && npm run build

# Test build
cd client && npm run preview
```

### Database
```bash
# Seed products
cd server && npm run seed:products

# Clear products
cd server && npm run seed:products:clear
```

### Git
```bash
# Check status
git status

# Create feature branch
git checkout -b feature/my-new-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to GitHub
git push origin feature/my-new-feature
```

---

## ⚡ RECENT UPDATES

### Latest Features (All on Main Branch):
1. ✅ **Certificates Page** - EUROLAB + ISO 9001/14001 certifications
2. ✅ **Security Enhancements** - ProtectedRoute with role-based access
3. ✅ **Product Seeding Script** - 10 real Mossaica products
4. ✅ **Image Upload Component** - Drag-drop with preview
5. ✅ **Analytics Dashboard** - Chart.js with 4 interactive charts
6. ✅ **SuperAdmin Panel** - Full CRUD for users, products, orders, quotes
7. ✅ **Customer Portal** - Dashboard, quotes, orders

---

## 🔐 ADMIN ACCESS

### Create Admin User:
```bash
cd server
npm run create-admin
```

### Default Admin (if seeded):
- **Email:** admin@ersozinc.com
- **Password:** Admin123!@#

---

## 🚨 TROUBLESHOOTING

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Failed
- Check your MongoDB URI in `server/.env`
- Verify network access in MongoDB Atlas
- Ensure IP address is whitelisted

### Factory Bridge Not Detecting Repository
1. Ensure repository is cloned to your computer
2. Check Factory Bridge settings
3. Verify the local path matches
4. Restart Factory Bridge if needed

---

## 📞 PRODUCTION DEPLOYMENTS

### Current Production URLs:
- **Frontend (Vercel):** https://ersoz-inc.vercel.app
- **Backend (Render):** https://ersoz-inc-api.onrender.com

### Deploy Changes:
```bash
# Push to main branch
git push origin main

# Vercel and Render auto-deploy from main
```

---

## 💡 TIPS FOR WORKING WITH FACTORY AI

1. **Be Specific:** "Add a certificate image gallery to CertificatesPage"
2. **Reference Files:** "Update the ProductsPage.tsx file"
3. **Test First:** Ask Factory to "test the build" before committing
4. **Commit Often:** Small, focused commits are better
5. **Use Branches:** Create feature branches for new work

---

## 📊 BUILD METRICS

**Latest Build:**
- JavaScript: 498.16 KB (144.73 KB gzipped)
- CSS: 51.44 KB (8.13 KB gzipped)
- Build Time: ~7-9 seconds
- TypeScript: 0 errors
- Status: ✅ Production Ready

---

## ✅ CHECKLIST FOR YOU

After cloning to your local computer:

- [ ] Repository cloned to local machine
- [ ] Dependencies installed (server & client)
- [ ] Environment files verified
- [ ] Backend starts successfully (`npm run dev`)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Factory Bridge detects local repository
- [ ] Can make a test commit and push

---

## 🎉 YOU'RE ALL SET!

Once you complete the checklist above, you're ready to develop locally with Factory AI assistance through Factory Bridge.

**All your changes will save directly to your computer!**

Need help with any step? Just ask Factory AI! 🚀
