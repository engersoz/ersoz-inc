# 🔐 Environment Variables Configuration Guide

This guide explains all environment variables needed for ERSOZ INC platform deployment.

---

## 📋 **Quick Answer**

**NO** - You do NOT need to add the API URL to Render environment variables.

- **Render (Backend)**: Does NOT need to know its own URL
- **Vercel (Frontend)**: Already configured via `.env.production` file

---

## 🎯 **Environment Variables by Service**

### 1️⃣ **RENDER (Backend) - REQUIRED**

These environment variables MUST be set in Render Dashboard:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Authentication (CRITICAL - Use strong secrets!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (IMPORTANT - Allow Vercel domain)
CORS_ORIGIN=https://ersoz-inc.vercel.app

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@ersozinc.com

# Twilio SMS (Optional - for 2FA)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

#### How to Set in Render:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Environment** tab
4. Add each variable with "Add Environment Variable"
5. Click **Save Changes**

---

### 2️⃣ **VERCEL (Frontend) - REQUIRED**

These environment variables MUST be set in Vercel Dashboard:

```bash
# API URL (Points to your Render backend)
VITE_API_URL=https://ersoz-inc-api.onrender.com/api
```

#### How to Set in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add `VITE_API_URL` with value `https://ersoz-inc-api.onrender.com/api`
5. Select **Production** environment
6. Click **Save**
7. **IMPORTANT**: Redeploy after adding environment variables

---

## ✅ **Current Configuration Status**

### Backend (Render)
- ✅ CORS configured to allow `https://ersoz-inc.vercel.app`
- ✅ API routes prefixed with `/api`
- ✅ Hardcoded in `server/src/index.js`

### Frontend (Vercel)
- ✅ API URL defined in `client/.env.production`
- ✅ Centralized API client in `client/src/lib/api.ts`
- ✅ All pages use the same API client

---

## 🔧 **How It Works**

### Frontend → Backend Communication

```
User Browser (Vercel)
    ↓
https://ersoz-inc.vercel.app/admin/login
    ↓
Frontend makes API call: api.post('/auth/login')
    ↓
api.ts uses VITE_API_URL environment variable
    ↓
Request sent to: https://ersoz-inc-api.onrender.com/api/auth/login
    ↓
Render backend receives request
    ↓
Checks CORS origin matches Vercel domain
    ↓
Processes login and returns JWT token
    ↓
Frontend stores token and redirects to /admin
```

---

## 🚨 **Common Issues & Solutions**

### Issue 1: "Not allowed by CORS"
**Cause:** Vercel domain not in CORS allowedOrigins  
**Solution:** Add to Render env: `CORS_ORIGIN=https://ersoz-inc.vercel.app`

### Issue 2: "API URL not found"
**Cause:** VITE_API_URL not set in Vercel  
**Solution:** Add environment variable in Vercel dashboard and redeploy

### Issue 3: "Login fails with 401"
**Cause:** JWT secrets not set or mismatched  
**Solution:** Set JWT_SECRET and JWT_REFRESH_SECRET in Render

### Issue 4: "Connection timeout"
**Cause:** Backend sleeping (Render free tier)  
**Solution:** First request may take 30-60 seconds, retry

---

## 📝 **Verification Checklist**

Use this checklist to verify your deployment:

### Render (Backend):
- [ ] MONGODB_URI is set and connects successfully
- [ ] JWT_SECRET is set (min 32 characters)
- [ ] JWT_REFRESH_SECRET is set (min 32 characters)
- [ ] CORS_ORIGIN includes `https://ersoz-inc.vercel.app`
- [ ] Service is deployed and running
- [ ] Health check passes at `https://ersoz-inc-api.onrender.com/`

### Vercel (Frontend):
- [ ] VITE_API_URL is set to `https://ersoz-inc-api.onrender.com/api`
- [ ] Environment variable is set for "Production"
- [ ] Project redeployed after adding env variable
- [ ] Site loads at `https://ersoz-inc.vercel.app`

### Integration Test:
- [ ] Navigate to `https://ersoz-inc.vercel.app/admin/login`
- [ ] Login form appears (not blank page)
- [ ] Enter: admin@ersozinc.com / Admin123!@#
- [ ] Login succeeds and redirects to /admin
- [ ] Admin dashboard loads with sidebar menu

---

## 🔐 **Security Best Practices**

### DO:
✅ Use strong, random secrets for JWT (min 32 characters)  
✅ Keep .env files out of git (already in .gitignore)  
✅ Use environment-specific values  
✅ Rotate secrets periodically  
✅ Use HTTPS for all production URLs  

### DON'T:
❌ Don't commit .env files to git  
❌ Don't use same secrets in dev/prod  
❌ Don't share secrets in public channels  
❌ Don't use weak/short secrets  
❌ Don't hardcode secrets in code  

---

## 🆘 **Quick Fix Commands**

### If frontend can't reach backend:

1. **Check Vercel env var:**
```bash
# Should output: https://ersoz-inc-api.onrender.com/api
echo $VITE_API_URL
```

2. **Test backend directly:**
```bash
curl https://ersoz-inc-api.onrender.com/
# Should return: {"success":true,"message":"ERSOZ INC Platform API","version":"1.0.0",...}
```

3. **Test login endpoint:**
```bash
curl -X POST https://ersoz-inc-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ersozinc.com","password":"Admin123!@#"}'
```

---

## 📞 **Need Help?**

If you're still experiencing issues:

1. Check Render logs: https://dashboard.render.com → Your Service → Logs
2. Check Vercel logs: https://vercel.com/dashboard → Your Project → Deployments → View Function Logs
3. Verify environment variables are set correctly in both platforms
4. Try redeploying after setting environment variables

---

## 🎉 **Summary**

**Answer to your question:**

**NO** - The API URL does NOT need to be added to Render environment variables.

**Why?**
- Render backend doesn't need to know its own URL
- The backend just runs on whatever host Render assigns
- Only CORS_ORIGIN needs to be set (already done)

**What you DO need to verify:**
1. ✅ **Vercel has `VITE_API_URL`** pointing to Render backend
2. ✅ **Render has `CORS_ORIGIN`** allowing Vercel domain
3. ✅ **Render has all JWT/DB secrets** set properly

That's it! The current configuration should work perfectly.
