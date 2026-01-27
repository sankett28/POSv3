/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker optimization
  
  // Explicitly pass env vars to client-side code
  // These MUST be set at build time via --build-arg in Docker
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Empty turbopack config to silence the warning
  turbopack: {},
}

// Validate env vars at module load time (works for both webpack and turbopack)
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error('❌ NEXT_PUBLIC_API_BASE_URL must be set at build time');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL must be set at build time');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY must be set at build time');
  }
  
  console.log('✅ All required env vars present at build time');
  console.log('   NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
}

module.exports = nextConfig

