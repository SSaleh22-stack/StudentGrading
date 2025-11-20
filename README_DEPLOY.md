# GitHub Pages Deployment Guide

## ✅ Configuration Complete

Your Next.js app is now configured for static export to GitHub Pages.

## Quick Start

### 1. Build the static site
```bash
npm run build
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build your Next.js app as static files
- Push to the `gh-pages` branch
- GitHub Pages will automatically serve your site

## What Changed

### ✅ Removed
- All API routes (`app/api/` folder) - not supported in static export
- Server-side functionality converted to client-side

### ✅ Updated
- Payment flow now calls Tap API directly from client
- All data storage uses localStorage (browser storage)
- Next.js config set to `output: 'export'`

### ⚠️ Important Notes

1. **CORS for Payments**: If Tap Payments API doesn't allow CORS from your domain, you may need to:
   - Use a CORS proxy service
   - Configure Tap Payments to whitelist your domain
   - Or use an alternative payment integration

2. **Data Storage**: All data is stored in browser localStorage. Users' data will be:
   - Stored locally in their browser
   - Not synced across devices
   - Cleared if they clear browser data

3. **Base Path**: If deploying to a subdirectory (e.g., `/my-app/`), update `next.config.js`:
   ```js
   basePath: '/YOUR-REPO-NAME',
   assetPrefix: '/YOUR-REPO-NAME/',
   ```

## GitHub Pages Setup

1. Go to your GitHub repository
2. Settings → Pages
3. Source: Select `gh-pages` branch
4. Folder: `/ (root)`
5. Save

Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Troubleshooting

- **Build fails**: Make sure all API route imports are removed
- **404 errors**: Check that `trailingSlash: true` is in `next.config.js`
- **Payment errors**: Check browser console for CORS errors

