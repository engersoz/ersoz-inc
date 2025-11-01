# MongoDB Atlas Connection Troubleshooting

## ❌ Current Issue: Authentication Failed

The connection string is properly formatted, but MongoDB Atlas is rejecting the credentials.

## 🔍 Steps to Fix

### 1. Verify Database User Credentials

Go to MongoDB Atlas → Database Access:

1. Click on **Database Access** in left sidebar
2. Find user: `engersoz_db_user`
3. Check if user exists and is enabled
4. **Reset the password** if needed (recommended)
5. Copy the **NEW** password

### 2. Check User Permissions

Ensure the user has proper permissions:

- ✅ **Atlas Admin** (full access), OR
- ✅ **Read and Write to any database**

### 3. Verify Network Access

Go to **Network Access**:

1. Ensure `0.0.0.0/0` is in the IP Access List
2. Status should be **Active** (not pending)
3. Wait 2-3 minutes after adding for it to take effect

### 4. Check Connection String

Your current format:
```
mongodb+srv://USERNAME:PASSWORD@ersozinc.6wnw7zk.mongodb.net/DATABASE?options
```

If password contains special characters, they need URL encoding:
- `@` becomes `%40`
- `:` becomes `%3A`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `#` becomes `%23`
- `[` becomes `%5B`
- `]` becomes `%5D`
- `%` becomes `%25`

### 5. Get Fresh Connection String

Best approach:

1. Go to MongoDB Atlas → **Clusters**
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select: **Driver: Node.js**, **Version: 4.1 or later**
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add `/ersoz_platform` before the `?` for database name

Example:
```
mongodb+srv://USERNAME:PASSWORD@ersozinc.6wnw7zk.mongodb.net/ersoz_platform?retryWrites=true&w=majority
```

## 🔧 Testing Connection

Once you have the corrected credentials, update `/project/workspace/ersoz-inc-platform/server/.env`:

```env
MONGODB_URI=mongodb+srv://NEW_USERNAME:NEW_PASSWORD@ersozinc.6wnw7zk.mongodb.net/ersoz_platform?retryWrites=true&w=majority&appName=ersozinc
```

Then test:

```bash
cd /project/workspace/ersoz-inc-platform/server
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Error:', err.message));
"
```

## 🔒 Security Reminders

- ✅ `.env` is in `.gitignore` (will NOT be committed)
- ✅ Never share your `.env` file
- ✅ Use different credentials for production
- ✅ Rotate passwords regularly

## 📋 Quick Checklist

- [ ] Database user exists in MongoDB Atlas
- [ ] Password is correct (no typos)
- [ ] User has proper permissions (Read/Write)
- [ ] 0.0.0.0/0 is in Network Access list
- [ ] Network Access status is **Active**
- [ ] Waited 2-3 minutes after network changes
- [ ] Special characters in password are URL encoded
- [ ] Connection string has correct format

## 🆘 Still Not Working?

Try these additional steps:

### Option 1: Create New Database User

1. Go to **Database Access**
2. Click **+ ADD NEW DATABASE USER**
3. Username: `ersoz_app_user`
4. Password: Click **AUTOGENERATE SECURE PASSWORD** (copy it!)
5. Database User Privileges: **Atlas admin**
6. Click **Add User**
7. Use new credentials in `.env`

### Option 2: Check Cluster Status

1. Go to **Clusters**
2. Ensure cluster status is **Active** (not paused)
3. If paused, click **Resume** and wait

### Option 3: Test with MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Paste your connection string
3. Try to connect
4. If Compass can't connect, the issue is with Atlas configuration

## 📞 Need Help?

Once you have the correct credentials:
1. Update `server/.env` file
2. Let me know and I'll test the connection again
3. We'll proceed with pushing the code to GitHub

---

**Current Connection String Format:**
```
mongodb+srv://engersoz_db_user:pj9L8p7nvarHnIKG@ersozinc.6wnw7zk.mongodb.net/ersoz_platform?retryWrites=true&w=majority&appName=ersozinc
```

**Issue:** Authentication failed - credentials may be incorrect or user may not exist.
