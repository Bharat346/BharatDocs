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
  // Cache static assets aggressively (pdf.worker.min.js, etc.)
  async headers() {
    return [
      {
        source: "/pdf.worker.min.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/pdf.min.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/pdf-render-worker.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/api/pdf",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=604800, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
