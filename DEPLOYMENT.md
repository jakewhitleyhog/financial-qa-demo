# Deployment Guide - Vercel + Render

This guide shows how to deploy your Customer Q&A webapp so you can share it with clients.

## Architecture
- **Frontend**: Vercel (free, static hosting)
- **Backend**: Render (free tier, Node.js server)
- **Database**: SQLite (persists on Render)

## Step-by-Step Deployment

### Part 1: Deploy Backend to Render (Free)

1. **Create a Render account**
   - Go to https://render.com
   - Sign up with GitHub (recommended)

2. **Push your code to GitHub**
   ```bash
   cd financial-qa-demo
   git init
   git add .
   git commit -m "Initial commit"

   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/financial-qa-demo.git
   git push -u origin main
   ```

3. **Deploy on Render**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `financial-qa-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=generate-a-random-32-char-string
     DEAL_NAME=Huntington Oil & Gas II
     DEAL_ID=1
     ANTHROPIC_API_KEY=your_api_key_here (optional for forum demo)
     ```
   - **JWT_SECRET is required** in production. Generate one with: `openssl rand -hex 32`

5. **Save the Backend URL**
   - After deployment, you'll get a URL like: `https://financial-qa-backend.onrender.com`
   - Copy this URL - you'll need it for frontend deployment

### Part 2: Deploy Frontend to Vercel

1. **Update Frontend API URL**

   Edit `frontend/vercel.json` and replace `your-backend-url.onrender.com` with your actual Render URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://financial-qa-backend.onrender.com/api/:path*"
       }
     ]
   }
   ```

2. **Deploy to Vercel**

   Option A - Using Vercel CLI (Recommended):
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy frontend
   cd frontend
   vercel

   # Follow the prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No
   # - Project name? financial-qa-demo
   # - Directory? ./
   # - Override settings? No
   ```

   Option B - Using Vercel Dashboard:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Click "Deploy"

3. **Get Your Demo URL**
   - After deployment: `https://financial-qa-demo.vercel.app`
   - Share this with your client!

### Part 3: Update Backend CORS

Once you have your Vercel URL, update the backend to allow requests from it:

1. In Render dashboard, add environment variable:
   ```
   FRONTEND_URL=https://financial-qa-demo.vercel.app
   ```

2. Render will automatically redeploy with the new setting

## Testing the Deployment

1. **Visit your Vercel URL**: https://your-app.vercel.app
2. **Check Forum Page**: Should load questions from database
3. **Check Chat Page**:
   - Without API key: Shows friendly message
   - With API key: Works fully

## Deployment Notes

### Free Tier Limitations

**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- Takes ~30 seconds to wake up on first request
- 750 hours/month free
- Perfect for demos!

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Perfect for client demos!

### For Production Use

If you want this running 24/7 for production:

1. **Upgrade Render**: $7/month for always-on
2. **Or use Railway**: Free $5 credit monthly
3. **Or use Fly.io**: Free tier with better uptime

## Quick Deploy (Alternative - Vercel Only)

If you want to deploy everything to Vercel (requires more setup):

1. Convert backend to Vercel serverless functions
2. Use Vercel Postgres or Supabase instead of SQLite
3. Update all Express routes to work as serverless functions

**This requires significant refactoring** - only recommended if you need everything on Vercel.

## Troubleshooting

### "Failed to fetch" errors
- Check backend URL in `frontend/vercel.json`
- Verify backend is running on Render
- Check CORS settings in backend `.env`

### Backend won't start on Render
- Check build logs in Render dashboard
- Verify `package.json` has correct start script
- Ensure all dependencies are in `dependencies`, not `devDependencies`

### Database not persisting
- Render free tier uses ephemeral filesystem
- Database will reset when server restarts
- For persistence, upgrade to paid plan or use cloud database

## Environment Variables Summary

**Backend (Render):**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-random-secret-here
DEAL_NAME=Huntington Oil & Gas II
DEAL_ID=1
ANTHROPIC_API_KEY=sk-ant-... (optional)
FRONTEND_URL=https://your-app.vercel.app
```

**Frontend (Vercel):**
No environment variables needed - uses `vercel.json` rewrites

## Cost Breakdown

**For Demo (Free):**
- Frontend: Vercel Free ($0)
- Backend: Render Free ($0)
- Total: **$0/month**

**For Production (Always-on):**
- Frontend: Vercel Free ($0)
- Backend: Render Starter ($7/month)
- Total: **$7/month**

## Next Steps

1. Follow Part 1 to deploy backend to Render
2. Get your backend URL
3. Update `frontend/vercel.json` with backend URL
4. Follow Part 2 to deploy frontend to Vercel
5. Share your Vercel URL with your client!

**Estimated time**: 15-20 minutes for full deployment
