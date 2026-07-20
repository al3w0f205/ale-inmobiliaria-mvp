/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://backend:8000/api';
    // Remove trailing /api to construct base URL
    const backendBase = backendUrl.replace(/\/api$/, '') || 'http://backend:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`, 
      },
      {
        source: '/media/:path*',
        destination: `${backendBase}/media/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${backendBase}/ws/:path*`,
      },
    ]
  },
};

export default nextConfig;

