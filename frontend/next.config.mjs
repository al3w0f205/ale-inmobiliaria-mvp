/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://images.unsplash.com; connect-src 'self' wss://mvp.rondira.com http://localhost:8000 wss://localhost:8000 http://backend:8000; frame-ancestors 'none';"
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ];
  },
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://backend:8000/api';
    // Remove trailing /api to construct base URL
    const backendBase = backendUrl.replace(/\/api$/, '') || 'http://backend:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*/`, 
      },
      {
        source: '/media/:path*',
        destination: `${backendBase}/media/:path*/`,
      },
      {
        source: '/ws/:path*',
        destination: `${backendBase}/ws/:path*/`,
      },
    ]
  },
};

export default nextConfig;

