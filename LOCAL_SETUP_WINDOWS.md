# 🪟 Local Setup Guide for Windows

## 📍 Setup Location
**Target Directory:** `C:\Users\enger\OneDrive\Documents\Projects\ersozinc`

---

## ✅ **PREREQUISITES**

Before you begin, make sure you have these installed on your Windows machine:

### Required Software:
1. **Node.js 18+** - [Download](https://nodejs.org/)
   - Verify: Open PowerShell and run `node --version`
   
2. **Git** - [Download](https://git-scm.com/download/win)
   - Verify: Run `git --version`

3. **A Code Editor** (Optional but recommended)
   - VS Code: [Download](https://code.visualstudio.com/)

---

## 🚀 **STEP-BY-STEP SETUP**

### **Step 1: Open PowerShell or Command Prompt**

Press `Win + X` and select "Windows PowerShell" or "Command Prompt"

---

### **Step 2: Navigate to Your Projects Directory**

```powershell
# Create the directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "C:\Users\enger\OneDrive\Documents\Projects"

# Navigate to the directory
cd "C:\Users\enger\OneDrive\Documents\Projects"
```

---

### **Step 3: Clone the Repository**

```powershell
# Clone from GitHub
git clone https://github.com/engersoz/ersoz-inc.git ersozinc

# Navigate into the project
cd ersozinc

# Switch to the feature branch with all the code
git checkout feature/complete-platform

# Verify you're on the right branch
git branch
```

**Expected output:** `* feature/complete-platform`

---

### **Step 4: Set Up Environment Variables**

#### **Backend .env File:**

```powershell
# Navigate to server directory
cd server

# Copy example env file
Copy-Item .env.example .env

# Open .env in notepad to edit
notepad .env
```

**Edit the `.env` file with these values:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://engersoz_db_user:vrAet1ArxEgb5xGM@ersozinc.6wnw7zk.mongodb.net/?retryWrites=true&w=majority&appName=ersozinc&dbName=ersoz_platform

# Security - Generate these with Node.js (see below)
JWT_SECRET=your_generated_jwt_secret_here
REFRESH_TOKEN_SECRET=your_generated_refresh_token_secret_here
ENCRYPTION_KEY=your_generated_encryption_key_here

# JWT Expiration
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Client URL
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional - Leave as is for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@ersozinc.com
FROM_NAME=ERSOZ INC

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**Generate Secure Secrets:**

In the same PowerShell window:

```powershell
# Generate JWT secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'));"
```

Copy the output and replace the placeholder values in your `.env` file.

**Save and close the `.env` file.**

---

### **Step 5: Install Backend Dependencies**

```powershell
# Make sure you're in the server directory
cd C:\Users\enger\OneDrive\Documents\Projects\ersozinc\server

# Install dependencies
npm install

# This will take a few minutes...
```

---

### **Step 6: Create Admin User**

```powershell
# Still in server directory, create admin user
node src/scripts/createAdminUser.js
```

**Expected output:**
```
✅ Connected to MongoDB
✅✅✅ Admin user created successfully! ✅✅✅

═══════════════════════════════════════
        ADMIN LOGIN CREDENTIALS        
═══════════════════════════════════════

📧 Email:    admin@ersozinc.com
🔑 Password: Admin@123456
👤 Role:     Administrator
```

---

### **Step 7: Install Frontend Dependencies**

```powershell
# Navigate to client directory
cd ..\client

# Install dependencies
npm install

# This will also take a few minutes...
```

---

### **Step 8: Start the Servers**

You need **TWO** PowerShell/Command Prompt windows:

#### **Window 1 - Backend Server:**

```powershell
# Navigate to server directory
cd C:\Users\enger\OneDrive\Documents\Projects\ersozinc\server

# Start backend
npm start
```

**Expected output:**
```
🚀 ERSOZ INC Platform Server Started
📍 Environment: development
🌐 Server running on port 5000
📚 API Docs: http://localhost:5000/api/docs
💾 Database: Connected
```

**✅ Keep this window open!**

---

#### **Window 2 - Frontend Server:**

```powershell
# Navigate to client directory
cd C:\Users\enger\OneDrive\Documents\Projects\ersozinc\client

# Start frontend
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**✅ Keep this window open too!**

---

## 🌐 **ACCESS YOUR PLATFORM**

Once both servers are running:

### **Frontend (Your Website):**
Open your browser and go to: **http://localhost:3000**

**Available Pages:**
- Homepage: http://localhost:3000/
- Products: http://localhost:3000/products
- Login: http://localhost:3000/login

### **Backend API:**
- Health Check: http://localhost:5000/health
- API Documentation: http://localhost:5000/api/docs

---

## 🔐 **LOGIN CREDENTIALS**

```
📧 Email:    admin@ersozinc.com
🔑 Password: Admin@123456
👤 Role:     Administrator
```

**Login at:** http://localhost:3000/login

---

## 🛠️ **BATCH SCRIPTS (Optional Automation)**

Create these batch files in your project root for easy startup:

### **start-backend.bat**
```batch
@echo off
echo Starting ERSOZ Backend Server...
cd /d "C:\Users\enger\OneDrive\Documents\Projects\ersozinc\server"
npm start
pause
```

### **start-frontend.bat**
```batch
@echo off
echo Starting ERSOZ Frontend Server...
cd /d "C:\Users\enger\OneDrive\Documents\Projects\ersozinc\client"
npm run dev
pause
```

### **start-all.bat** (Both servers)
```batch
@echo off
echo Starting ERSOZ INC Platform...
echo.
echo Starting Backend Server...
start "ERSOZ Backend" cmd /k "cd /d C:\Users\enger\OneDrive\Documents\Projects\ersozinc\server && npm start"

timeout /t 5

echo Starting Frontend Server...
start "ERSOZ Frontend" cmd /k "cd /d C:\Users\enger\OneDrive\Documents\Projects\ersozinc\client && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press any key to exit this window (servers will keep running)
pause
```

**To use these:** 
1. Create new text files with the names above
2. Copy the content
3. Save them in `C:\Users\enger\OneDrive\Documents\Projects\ersozinc\`
4. Double-click to run!

---

## 🐛 **TROUBLESHOOTING**

### **Port Already in Use:**

If you get an error like "Port 3000 is already in use":

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or kill by port (requires admin)
npx kill-port 3000
npx kill-port 5000
```

### **MongoDB Connection Failed:**

Make sure your MongoDB connection string in `.env` is correct:
```
mongodb+srv://engersoz_db_user:vrAet1ArxEgb5xGM@ersozinc.6wnw7zk.mongodb.net/?retryWrites=true&w=majority&appName=ersozinc&dbName=ersoz_platform
```

### **Module Not Found Errors:**

```powershell
# Clear node_modules and reinstall
cd server
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

cd ..\client
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### **Git Checkout Issues:**

```powershell
# Make sure you're on the right branch
git status
git checkout feature/complete-platform
git pull origin feature/complete-platform
```

---

## 📁 **DIRECTORY STRUCTURE**

After setup, your directory should look like:

```
C:\Users\enger\OneDrive\Documents\Projects\ersozinc\
├── README.md
├── docs/                     # All documentation
│   ├── START_APPLICATION.md
│   ├── SETUP.md
│   └── ...
├── server/                   # Backend
│   ├── src/
│   ├── .env                 # ✅ Your environment file
│   ├── package.json
│   └── node_modules/
├── client/                   # Frontend
│   ├── src/
│   ├── package.json
│   └── node_modules/
└── batch scripts (optional)
```

---

## ✅ **VERIFICATION CHECKLIST**

Before accessing the platform, verify:

- [ ] Node.js is installed (`node --version`)
- [ ] Git is installed (`git --version`)
- [ ] Repository cloned to correct location
- [ ] On `feature/complete-platform` branch
- [ ] Backend `.env` file created with correct values
- [ ] Backend dependencies installed (`server/node_modules` exists)
- [ ] Frontend dependencies installed (`client/node_modules` exists)
- [ ] Admin user created in MongoDB
- [ ] Backend server running (Window 1)
- [ ] Frontend server running (Window 2)
- [ ] Can access http://localhost:3000 in browser
- [ ] Can login with admin@ersozinc.com / Admin@123456

---

## 🎯 **NEXT STEPS**

Once everything is running:

1. ✅ **Test the login** - Use admin credentials
2. 🎨 **Explore the platform** - Navigate through pages
3. 📝 **Add content** - Start adding your products
4. 🔧 **Customize** - Modify as needed for your business

---

## 📞 **NEED HELP?**

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in the PowerShell windows
3. Check `docs/` folder for additional documentation
4. Ensure MongoDB Atlas is accessible (0.0.0.0/0 in whitelist)

---

## 🔄 **UPDATING YOUR CODE**

To get latest updates from GitHub:

```powershell
cd C:\Users\enger\OneDrive\Documents\Projects\ersozinc

# Save any local changes
git stash

# Pull latest code
git pull origin feature/complete-platform

# Reapply your changes (if any)
git stash pop

# Update dependencies
cd server && npm install
cd ..\client && npm install
```

---

**Setup Time:** ~15-20 minutes  
**Difficulty:** Easy  
**Support:** Full documentation in `/docs` folder

---

🎉 **You're all set! Follow these steps and your platform will be running locally!** 🎉
