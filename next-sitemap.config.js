/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://bharat-docs.vercel.app", 
  generateRobotsTxt: true,
  changefreq: "daily",      
  priority: 0.7,            
  sitemapSize: 5000,         
  exclude: ["/admin/*"],    
};
