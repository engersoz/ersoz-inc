# 🚀 Render.com Deployment Guide for ERSOZ INC Backend

## 📋 **Prerequisites**
- [x] GitHub repository with code pushed
- [ ] Render.com account (free tier works!)
- [ ] MongoDB Atlas database (already configured)

---

## 🎯 **Step-by-Step Render Setup**

### **Step 1: Create Render Account**
1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

---

### **Step 2: Connect GitHub Repository**

#### Option A: Using Dashboard (Recommended for First Time)
1. **Log in to Render Dashboard:** https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**
4. Click **"Connect GitHub"** (if not already connected)
5. Grant Render access to your repositories
6. Find and select: **`engersoz/ersoz-inc`**

#### Option B: Using Blueprint (Automated)
1. Go to: https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect your repository
4. Render will detect `render.yaml` automatically

---

### **Step 3: Configure Web Service**

Use these exact settings:

#### **Basic Settings:**
```
Name:              ersoz-inc-api
Environment:       Node
Region:            Oregon (US West)
Branch:            main
Root Directory:    (leave empty - we handle in commands)
```

#### **Build & Deploy:**
```
Build Command:     cd server && npm ci
Start Command:     cd server && npm start
```

#### **Plan:**
```
Instance Type:     Free
                   (or Starter $7/month for better performance)
```

---

### **Step 4: Environment Variables** ⭐ CRITICAL

Click **"Add Environment Variable"** for each:

#### **Required Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `5000` | Port number (Render uses 10000 internally) |
| `MONGODB_URI` | `mongodb+srv://engersoz:<password>@cluster0.mongodb.net/ersoz_inc_db?retryWrites=true&w=majority` | **PASTE YOUR FULL MONGODB URI** |
| `JWT_SECRET` | Click "Generate" | Auto-generates secure secret |
| `JWT_REFRESH_SECRET` | Click "Generate" | Auto-generates secure secret |
| `ENCRYPTION_KEY` | Click "Generate" | Auto-generates 32-char key |
| `SESSION_SECRET` | Click "Generate" | Auto-generates secure secret |
| `CORS_ORIGIN` | `https://ersoz-inc.vercel.app` | Your Vercel frontend URL |

#### **Optional but Recommended:**

| Key | Value | Notes |
|-----|-------|-------|
| `JWT_ACCESS_EXPIRATION` | `15m` | Token lifetime |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh token lifetime |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

#### **For Email Features (Optional):**

| Key | Value | Notes |
|-----|-------|-------|
| `SMTP_HOST` | `smtp.gmail.com` | Your SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `your-email@gmail.com` | SMTP username |
| `SMTP_PASS` | `your-app-password` | App-specific password |
| `SMTP_FROM` | `noreply@ersozinc.com` | From address |

#### **For SMS Features (Optional):**

| Key | Value | Notes |
|-----|-------|-------|
| `TWILIO_ACCOUNT_SID` | `AC...` | From Twilio dashboard |
| `TWILIO_AUTH_TOKEN` | `...` | From Twilio dashboard |
| `TWILIO_PHONE_NUMBER` | `+1...` | Your Twilio number |

---

### **Step 5: Configure MongoDB Access**

Your MongoDB needs to allow Render's IP addresses:

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com
2. **Navigate to:** Network Access (left sidebar)
3. **Click:** "Add IP Address"
4. **Choose:** "Allow Access from Anywhere" (0.0.0.0/0)
   - *Or add specific Render IPs for better security*
5. **Click:** "Confirm"

#### **Render IP Ranges (for specific access):**
```
35.153.82.0/23
44.210.64.0/23
3.209.176.0/23
```

---

### **Step 6: Deploy!**

1. **Review all settings**
2. Click **"Create Web Service"**
3. **Watch the build logs** (in real-time)
4. Wait for: `✅ Live` status (usually 2-5 minutes)

---

## ✅ **Verify Deployment**

### **Check Health Endpoint:**
```bash
curl https://ersoz-inc-api.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-06T...",
  "uptime": 123.456,
  "database": "connected"
}
```

### **Check API Docs:**
```
https://ersoz-inc-api.onrender.com/api-docs
```

### **Test Authentication:**
```bash
curl -X POST https://ersoz-inc-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ersozinc.com","password":"Admin123!@#"}'
```

---

## 🔗 **Connect Frontend to Backend**

### **Step 1: Get Your Render URL**
After deployment, your URL will be:
```
https://ersoz-inc-api.onrender.com
```

### **Step 2: Update Vercel Environment Variable**

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Select your project:** `ersoz-inc`
3. **Go to:** Settings → Environment Variables
4. **Add new variable:**
   ```
   Name:  VITE_API_URL
   Value: https://ersoz-inc-api.onrender.com/api/v1
   ```
5. **Apply to:** Production, Preview, Development
6. **Click:** "Save"

### **Step 3: Redeploy Vercel**

1. **Go to:** Deployments tab
2. **Click:** "Redeploy" on latest deployment
3. **Wait for:** Deployment to complete
4. **Visit:** https://ersoz-inc.vercel.app

---

## 🐛 **Troubleshooting**

### **Build Fails:**

**Error:** `npm: command not found`
- **Fix:** Ensure "Environment" is set to "Node"

**Error:** `Cannot find module 'express'`
- **Fix:** Change build command to: `cd server && npm ci` (with --production removed)

**Error:** `ENOENT: no such file or directory`
- **Fix:** Verify "Root Directory" is empty or set to `server`

### **Deployment Issues:**

**Error:** `Port 5000 already in use`
- **Fix:** Don't worry - Render remaps to port 10000 automatically

**Error:** `MongooseError: Operation buffering timed out`
- **Fix:** Check MongoDB Atlas Network Access whitelist
- **Fix:** Verify MONGODB_URI is correct with password

**Error:** `CORS error from frontend`
- **Fix:** Verify `CORS_ORIGIN` matches your Vercel URL exactly
- **Fix:** Check that backend is using latest index.js with CORS config

### **Service Won't Start:**

**Check logs:**
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for error messages

**Common issues:**
- Missing environment variables (JWT_SECRET, MONGODB_URI)
- Invalid MongoDB connection string
- Port binding errors (usually auto-fixed by Render)

---

## 📊 **Monitoring Your Service**

### **Render Dashboard Features:**

1. **Logs:**
   - Real-time application logs
   - Access via "Logs" tab
   - Can download or search

2. **Metrics:**
   - CPU usage
   - Memory usage
   - Request count
   - Response times

3. **Health Checks:**
   - Automatic checks at `/health`
   - Alerts if service goes down
   - Auto-restart on failures

### **Free Tier Limitations:**

⚠️ **Important:** Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to Starter plan ($7/month) for 24/7 uptime
- Or use a cron job to ping every 10 minutes

### **Keep Free Tier Alive (Optional):**

Use a service like **UptimeRobot** (free):
1. Go to: https://uptimerobot.com
2. Add monitor:
   ```
   Type: HTTP(s)
   URL: https://ersoz-inc-api.onrender.com/health
   Interval: 5 minutes
   ```

---

## 🔒 **Security Best Practices**

### **Already Configured:**
- ✅ HTTPS enabled by default
- ✅ Environment variables encrypted
- ✅ Helmet.js security headers
- ✅ Rate limiting
- ✅ CORS protection

### **Additional Steps:**

1. **Enable 2FA on Render account**
2. **Use strong MongoDB password**
3. **Regularly update dependencies:**
   ```bash
   npm audit
   npm update
   ```
4. **Monitor logs for suspicious activity**
5. **Set up error tracking (Sentry):**
   - Add `SENTRY_DSN` environment variable

---

## 💰 **Pricing**

### **Free Tier:**
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ 100 GB bandwidth
- ✅ Spins down after 15 min inactivity
- ✅ Shared CPU
- ✅ 512 MB RAM

### **Starter ($7/month):**
- ✅ Always on (no spin down)
- ✅ 0.5 CPU
- ✅ 512 MB RAM
- ✅ 100 GB bandwidth
- ✅ Better performance

### **Standard ($25/month):**
- ✅ 1 CPU
- ✅ 2 GB RAM
- ✅ 500 GB bandwidth
- ✅ Production-ready

**Recommendation:** Start with free tier, upgrade to Starter when launching.

---

## 🔄 **Automatic Deployments**

Render automatically deploys when you push to your main branch!

### **Enable Auto-Deploy:**
1. Go to service settings
2. Under "Build & Deploy"
3. Enable "Auto-Deploy"
4. Select branch: `main`

### **Deploy New Changes:**
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will automatically:
1. Pull latest code
2. Run build command
3. Deploy new version
4. Switch traffic to new deployment

---

## ✅ **Post-Deployment Checklist**

- [ ] Service status shows "Live" in Render dashboard
- [ ] Health endpoint returns 200 OK
- [ ] MongoDB connection successful (check logs)
- [ ] CORS allows requests from Vercel
- [ ] JWT authentication works
- [ ] API documentation accessible at `/api-docs`
- [ ] Frontend can login successfully
- [ ] Frontend can load products
- [ ] Frontend can create quotes

---

## 🎉 **Success!**

Your backend is now live at:
```
https://ersoz-inc-api.onrender.com
```

### **Quick Test:**
```bash
# Test health
curl https://ersoz-inc-api.onrender.com/health

# Test API
curl https://ersoz-inc-api.onrender.com/api/v1/products

# Test login
curl -X POST https://ersoz-inc-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ersozinc.com","password":"Admin123!@#"}'
```

---

## 🆘 **Need Help?**

### **Render Support:**
- Community Forum: https://community.render.com
- Documentation: https://render.com/docs
- Status Page: https://status.render.com

### **Our Documentation:**
- Main Guide: `DEPLOYMENT_GUIDE.md`
- Environment Setup: `server/.env.example`
- API Docs: Available at `/api-docs` after deployment

---

## 📝 **Next Steps After Backend Deployment:**

1. ✅ Copy your Render URL
2. ✅ Add to Vercel environment variables
3. ✅ Redeploy Vercel frontend
4. ✅ Test full integration
5. ✅ Set up monitoring (UptimeRobot)
6. ✅ Configure email/SMS if needed
7. ✅ Review logs for any errors

---

**🚀 You're ready to launch your ERSOZ INC platform!**
