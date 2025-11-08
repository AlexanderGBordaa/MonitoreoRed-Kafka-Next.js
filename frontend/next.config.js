/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "supports-color": false,
      "bufferutil": false,
      "utf-8-validate": false,
    };
    return config;
  },
};

module.exports = nextConfig;
