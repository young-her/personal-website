// Netlify Functions 版本 - Sitemap
exports.handler = async (event, context) => {
  const baseUrl = 'https://your-site.netlify.app'; // 替换为您的域名
  
  // 静态页面
  const staticPages = [
    { url: baseUrl, lastmod: new Date().toISOString(), priority: '1.0' },
    { url: `${baseUrl}/blog`, lastmod: new Date().toISOString(), priority: '0.8' },
    { url: `${baseUrl}/tools`, lastmod: new Date().toISOString(), priority: '0.8' }
  ];

  // 博客文章（简化版）
  const blogPosts = [
    { slug: 'web-performance-optimization', date: '2024-01-15' },
    { slug: 'react-best-practices', date: '2024-01-10' }
  ];
  
  const blogPages = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastmod: new Date(post.date).toISOString(),
    priority: '0.6'
  }));

  const allPages = [...staticPages, ...blogPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    },
    body: sitemapXml
  };
}; 