/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  serverExternalPackages: ["pdfjs-dist", "canvas", "tesseract.js"],
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "api.github.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
    localPatterns: [
      {
        pathname: "/api/image-proxy",
        search: "?*",
      },
    ],
  },
};

export default nextConfig;
