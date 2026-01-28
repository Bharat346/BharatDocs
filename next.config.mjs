/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  swcMinify: true, // Faster minification
  productionBrowserSourceMaps: false, //Remove source maps in production
  reactCompiler: true,
};

export default nextConfig;
