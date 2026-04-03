/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://bhdocs.in",
  generateRobotsTxt: true,

  // ❗ IMPORTANT: exclude useless routes
  exclude: [
    "/admin/*",
    "/api/*",
    "/_not-found",
  ],

  // Add dynamic routes manually
  additionalPaths: async (config) => {
    const paths = [];

    // Static pages
    paths.push(
      { loc: "/", priority: 1.0 },
      { loc: "/docs", priority: 0.9 },
      { loc: "/notes", priority: 0.8 },
      { loc: "/search", priority: 0.7 },
    );

    // 🔥 Example dynamic docs
    const docs = ["intro", "setup", "guide"]; // replace with real data

    docs.forEach((slug) => {
      paths.push({
        loc: `/docs/${slug}`,
        priority: 0.8,
      });
    });

    return paths;
  },
};