/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Add backend and infrastructure to ignored directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backend/**', '**/infrastructure/**', '**/node_modules/**']
    };
    return config;
  }
};

module.exports = nextConfig;