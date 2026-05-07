/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  // Allow images from external domains if needed in future
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
