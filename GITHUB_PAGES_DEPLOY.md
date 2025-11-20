# Deploying to GitHub Pages

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **GitHub Pages enabled**: Go to your repo Settings → Pages → Select source branch (usually `main` or `gh-pages`)

## Deployment Steps

### 1. Build the static site

```bash
npm run build
```

This will create an `out` folder with all static files.

### 2. Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
- Build the site
- Push the `out` folder to the `gh-pages` branch
- GitHub Pages will automatically serve it

### 3. Access your site

Your site will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

If you're using a custom domain, configure it in GitHub Pages settings.

## Important Notes

### API Routes Removed
- All API routes have been removed for static export
- Payment functionality now calls Tap API directly from client
- All data is stored in localStorage (browser storage)

### CORS Considerations
- If Tap Payments API doesn't allow CORS, you may need to:
  1. Use a CORS proxy service
  2. Or configure Tap Payments to allow your domain
  3. Or use a different payment integration method

### Base Path (if using subdirectory)
If your site is not at the root (e.g., `/my-app/`), update `next.config.js`:

```js
basePath: '/YOUR-REPO',
assetPrefix: '/YOUR-REPO/',
```

## Troubleshooting

### Build fails
- Make sure all API route imports are removed
- Check that all dynamic routes are properly configured

### 404 errors
- Ensure `trailingSlash: true` is set in `next.config.js`
- Check that GitHub Pages is serving from the correct branch

### Payment not working
- Check browser console for CORS errors
- Verify Tap Payments API keys are set correctly
- Consider using a CORS proxy if needed

