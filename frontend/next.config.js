/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Performance: Enable SWC minification for faster builds and smaller bundles
  swcMinify: true,
  // Performance: Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Performance: Enable compression
  compress: true,
  // Performance: Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
  output: 'standalone', // Required for Docker optimization
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig

