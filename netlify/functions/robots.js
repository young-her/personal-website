// Netlify Functions 版本 - Robots.txt
exports.handler = async (event, context) => {
  const baseUrl = 'https://your-site.netlify.app'; // 替换为您的域名
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /private/
Disallow: /admin/

Sitemap: ${baseUrl}/.netlify/functions/sitemap`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    },
    body: robotsTxt
  };
}; 