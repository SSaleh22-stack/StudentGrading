/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use 'export' for production builds, not dev server
  // Dev server has limitations with dynamic routes when output: 'export' is set
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Disable API routes for static export
  // All functionality now works client-side with localStorage
  // Skip type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
