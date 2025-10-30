# MarketMesh - Single Port Deployment on Render

## 🚀 Simplified Deployment (Frontend + Backend on ONE Port)

Your backend now serves the Angular frontend, so everything runs on a single port (3001). This makes deployment much simpler!

---

## Prerequisites

✅ MongoDB Atlas cluster created
✅ GitHub repository with latest code pushed
✅ Render account at https://render.com

---

## Deployment Steps

### Step 1: Deploy to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub and select `marketmesh` repository

### Step 2: Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `marketmesh` (or your choice) |
| **Root Directory** | Leave empty (use root) |
| **Environment** | `Node` |
| **Build Command** | `npm run build:frontend` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Step 3: Set Environment Variables

In the **Environment** tab, add:

| Name | Value |
|------|-------|
| `MONGO_URI` | `mongodb+srv://akshath:hehehaha@sugandhi.nlcralx.mongodb.net/marketmesh?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_super_secret_jwt_key_change_this` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build and deploy
3. Once live, you'll get ONE URL (e.g., `https://marketmesh.onrender.com`)

---

## How It Works

1. **Build Process:** 
   - Render runs `npm run build:frontend`
   - Angular frontend is built to `frontend-angular/dist/frontend-angular/`

2. **Runtime:**
   - Backend Express server starts on port 3001
   - Serves API routes at `/api/*`
   - Serves Angular static files for all other routes

3. **Routing:**
   - `https://your-app.onrender.com/api/products` → Backend API
   - `https://your-app.onrender.com/` → Angular Frontend
   - `https://your-app.onrender.com/shop` → Angular Frontend

---

## Test Your Deployment

Open your Render URL and test:
- ✅ Homepage loads
- ✅ Products display
- ✅ Register/Login works
- ✅ Cart functionality
- ✅ All features working

---

## Local Development

For development, use the `dev` script to run frontend and backend separately:

```bash
npm run dev
```

This runs:
- Backend on `http://localhost:3001`
- Angular dev server on `http://localhost:4200`

---

## Seed Database (Optional)

### Option 1: Seed Locally to Atlas
```bash
cd backend
MONGO_URI="your-atlas-uri" npm run seed
```

### Option 2: Seed on Render
1. Go to your Render service → Shell tab
2. Run: `cd backend && npm run seed`

---

## Benefits of Single Port

✅ **Simpler deployment** - Only one service to manage
✅ **No CORS issues** - Frontend and backend on same origin
✅ **Lower cost** - One service instead of two
✅ **Easier to manage** - Single URL for everything

---

## Troubleshooting

### Build Fails
- Check that frontend-angular builds successfully locally
- Verify all dependencies are in package.json

### Frontend loads but no data
- Check environment variables in Render (especially MONGO_URI)
- View logs in Render dashboard for errors

### 404 errors on refresh
- Make sure server.js has the `app.get('*')` catch-all route
- Verify NODE_ENV is set to 'production'

---

## Your URLs After Deployment

- **Everything:** `https://marketmesh.onrender.com`
- **API:** `https://marketmesh.onrender.com/api/*`
- **Frontend:** `https://marketmesh.onrender.com/*`

---

*Last updated: October 30, 2025*
