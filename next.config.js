/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mounting during test anti-refresh checks
  images: {
    domains: ["images.unsplash.com"],
  },
};

module.exports = nextConfig;
