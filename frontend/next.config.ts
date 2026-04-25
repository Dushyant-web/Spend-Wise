import type { NextConfig } from 'next'


const nextConfig: NextConfig = {
  // Static export — works for Netlify (web) + Capacitor (iOS/Android)
  // All data fetching is client-side (React Query → FastAPI), so no SSR needed
  output: 'export',
  trailingSlash: true,

  images: {
    // Required for static export — Netlify/Capacitor serve images directly
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },

  // headers() not supported with output: export — security headers handled by netlify.toml
}

export default nextConfig
