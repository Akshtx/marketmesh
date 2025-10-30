# MarketMesh - Render Deployment Guide

## 🚀 Complete Deployment Steps for Render

This guide will help you deploy your MarketMesh application with:
- **Backend (Express API)** on Render as a Web Service
- **Frontend (Angular)** on Render as a Static Site
- **Database** using MongoDB Atlas

---

## Prerequisites

✅ MongoDB Atlas cluster created with connection string
✅ GitHub repository with latest code pushed
✅ Render account created at https://render.com

---

## Part 1: Deploy Backend (Express API)

### Step 1: Create Backend Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the `marketmesh` repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `marketmesh-backend` (or your choice) |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Step 2: Set Environment Variables

In the **Environment** tab, add these variables:

| Name | Value |
|------|-------|
| `MONGO_URI` | `mongodb+srv://akshath:hehehaha@sugandhi.nlcralx.mongodb.net/marketmesh?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_super_secret_jwt_key_change_this_in_production` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for the build and deploy to complete (5-10 minutes)
3. Once live, **copy your backend URL** (e.g., `https://marketmesh-backend.onrender.com`)

---

## Part 2: Deploy Frontend (Angular)

### Step 1: Update Frontend to Use Your Backend URL

**IMPORTANT:** Before deploying the frontend, you need to update the API URL.

1. Open `frontend-angular/src/environments/environment.prod.ts`
2. Replace `YOUR_RENDER_BACKEND_URL` with your actual backend URL from Part 1
3. Example:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://marketmesh-backend.onrender.com/api'  // Replace this!
   };
   ```
4. Save the file
5. Rebuild the production files:
   ```bash
   cd frontend-angular
   ng build --configuration=production
   ```
6. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Update production API URL for Render backend"
   git push
   ```

### Step 2: Create Frontend Static Site

1. Go back to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Select the same `marketmesh` repository
4. Configure the site:

| Setting | Value |
|---------|-------|
| **Name** | `marketmesh-frontend` (or your choice) |
| **Root Directory** | `frontend-angular` |
| **Build Command** | `npm install && ng build --configuration=production` |
| **Publish Directory** | `dist/frontend-angular` |

### Step 3: Deploy

1. Click **"Create Static Site"**
2. Wait for the build and deploy to complete
3. Once live, you'll get a URL like `https://marketmesh-frontend.onrender.com`

---

## Part 3: Update Backend CORS (if needed)

If your frontend can't connect to the backend, you may need to update CORS settings.

1. Open `backend/server.js`
2. Find the CORS configuration and update it:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: ['https://marketmesh-frontend.onrender.com', 'http://localhost:4200'],
     credentials: true
   }));
   ```
3. Commit and push:
   ```bash
   git add backend/server.js
   git commit -m "Update CORS for Render frontend"
   git push
   ```
4. Render will auto-deploy the backend with the new CORS settings

---

## Part 4: Seed Your Database (Optional)

If you need to seed your MongoDB Atlas database with initial data:

### Option 1: Run Locally
```bash
cd backend
MONGO_URI="mongodb+srv://akshath:hehehaha@sugandhi.nlcralx.mongodb.net/marketmesh?retryWrites=true&w=majority" npm run seed
```

### Option 2: Run on Render
1. In your backend service, go to **Shell** tab
2. Run: `npm run seed`

---

## Part 5: Test Your Deployment

1. Open your frontend URL (e.g., `https://marketmesh-frontend.onrender.com`)
2. Test the following:
   - ✅ Homepage loads
   - ✅ Products display in Shop page
   - ✅ Register a new account
   - ✅ Login works
   - ✅ Add items to cart
   - ✅ View offers/promo codes
   - ✅ Logout and login again

---

## 🎉 Success Checklist

- ✅ Backend deployed and accessible
- ✅ Frontend deployed and accessible
- ✅ MongoDB Atlas connected
- ✅ Frontend can call backend API
- ✅ Authentication works
- ✅ Products load correctly
- ✅ Cart functionality works

---

## Troubleshooting

### Backend Issues

**Problem:** MongoDB connection error
- **Solution:** Double-check `MONGO_URI` in Render environment variables (no quotes, no extra spaces)

**Problem:** Backend returns 404 for API calls
- **Solution:** Make sure backend is running and the URL is correct (should end with `/api`)

### Frontend Issues

**Problem:** Frontend can't connect to backend
- **Solution:** 
  1. Check `environment.prod.ts` has the correct backend URL
  2. Rebuild frontend: `ng build --configuration=production`
  3. Check backend CORS settings allow your frontend domain

**Problem:** Pages load but no data
- **Solution:** Check browser console for API errors, verify backend is running

### CORS Errors

**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Solution:** Update `backend/server.js` CORS config to include your frontend URL

---

## Useful Commands

### Check Backend Logs
```bash
# In Render dashboard, go to your backend service → Logs tab
```

### Rebuild Frontend Locally
```bash
cd frontend-angular
ng build --configuration=production
```

### Test Backend Locally with Atlas
```bash
cd backend
MONGO_URI="mongodb+srv://..." npm start
```

---

## Important Notes

1. **Free Tier Limitations:**
   - Render free services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading for production use

2. **Security:**
   - Change JWT_SECRET to a strong, unique value
   - Never commit sensitive credentials to GitHub
   - Use Render's environment variables for all secrets

3. **MongoDB Atlas:**
   - Monitor your database usage in Atlas dashboard
   - Set up IP whitelist for better security (instead of 0.0.0.0/0)
   - Enable automated backups

---

## Your URLs

After deployment, save these:

- **Frontend:** `https://marketmesh-frontend.onrender.com` (replace with your actual URL)
- **Backend:** `https://marketmesh-backend.onrender.com` (replace with your actual URL)
- **MongoDB:** Atlas connection string (keep secret!)

---

## Next Steps

1. ✅ Custom domain (optional) - Add your own domain in Render settings
2. ✅ SSL/HTTPS - Automatically provided by Render
3. ✅ Monitoring - Set up alerts in Render dashboard
4. ✅ Performance - Upgrade to paid tier for better performance

---

**Need Help?**
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

---

*Last updated: October 30, 2025*
