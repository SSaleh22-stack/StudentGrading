# Deploying to GitHub Pages

## Prerequisites

1. GitHub account
2. Repository created on GitHub

## Setup Steps

### 1. Install gh-pages (if not already installed)
```bash
npm install --save-dev gh-pages
```

### 2. Update package.json (already done)
The scripts are already configured:
- `build`: Builds the static site
- `export`: Alias for build (Next.js 15 doesn't need separate export)
- `predeploy`: Runs before deploy (builds the site)
- `deploy`: Deploys to GitHub Pages

### 3. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 4. Add GitHub Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 5. Update next.config.js for GitHub Pages (if using subpath)

If your repository name is not the same as your GitHub username, you may need a base path:

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // If deploying to https://username.github.io/repo-name/
  basePath: '/repo-name',
  assetPrefix: '/repo-name/',
}
```

**Note:** If deploying to `https://username.github.io` (user site), you don't need basePath.

### 6. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
1. Build your Next.js app as static files
2. Deploy the `out` folder to the `gh-pages` branch
3. Make it available at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 7. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select **gh-pages** branch and **/ (root)** folder
5. Click **Save**

Your site will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPO/` (if using basePath)
- `https://YOUR_USERNAME.github.io/` (if deploying to user site)

## Important Notes

⚠️ **API Routes Removed**: All API routes have been removed. The app now works entirely client-side with localStorage.

⚠️ **Payment API**: The payment flow now calls Tap Payments API directly from the client. This may have CORS limitations. If you encounter CORS errors, you'll need to:
- Use a CORS proxy service, OR
- Deploy to a platform that supports API routes (like Vercel)

⚠️ **Environment Variables**: For GitHub Pages, you can't use server-side environment variables. All env vars must be prefixed with `NEXT_PUBLIC_` to be available in the client.

## Updating Your Site

After making changes:
```bash
git add .
git commit -m "Update site"
git push
npm run deploy
```

## Troubleshooting

### Build Errors
- Make sure all API route imports are removed
- Check that `output: 'export'` is in next.config.js

### 404 Errors
- Check that `trailingSlash: true` is set
- Verify basePath matches your repository name

### Payment CORS Errors
- The Tap Payments API may block direct client calls
- Consider using a CORS proxy or switching to Vercel for API route support
