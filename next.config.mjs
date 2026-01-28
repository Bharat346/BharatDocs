/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true, // Faster minification
  productionBrowserSourceMaps: false, //Remove source maps in production
  reactStrictMode: true, // Helps catch bugs early
  reactCompiler: true,

  output: "standalone", // Smaller serverless output
  poweredByHeader: false, // Removes "X-Powered-By" header
  optimizeCss: true, // Experimental: optimize CSS automatically

  compress: true, // Enable gzip compression
};

export default nextConfig;
