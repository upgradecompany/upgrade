/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Allow images from external sources
  images: {
    domains: ['images.psacard.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.psacard.com',
      },
    ],
  },
}

module.exports = nextConfig
