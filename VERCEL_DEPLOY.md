# Deploying to Vercel

## Quick Deploy

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js and deploy

3. **Environment Variables (if needed):**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add any required env vars (e.g., `NEXT_PUBLIC_TAP_SECRET_KEY`, `NEXT_PUBLIC_TAP_MERCHANT_ID`)

## That's it!

Vercel automatically:
- Builds your Next.js app
- Supports API routes
- Provides HTTPS
- Handles deployments on every push

