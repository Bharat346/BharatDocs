/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist", "canvas", "tesseract.js"],
  },
};

export default nextConfig;
