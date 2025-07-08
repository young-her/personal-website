// Netlify Functions 版本 - RSS Feed
exports.handler = async (event, context) => {
  // 简化的博客数据 - 实际项目中可以从文件系统读取
  const posts = [
    {
      slug: 'web-performance-optimization',
      title: 'Web性能优化完全指南',
      description: '深入探讨Web性能优化的各种技术和最佳实践',
      date: '2024-01-15',
      author: 'Young',
      tags: ['性能优化', 'Web开发', 'JavaScript', '前端']
    },
    {
      slug: 'react-best-practices', 
      title: 'React最佳实践指南',
      description: '总结React开发中的最佳实践',
      date: '2024-01-10',
      author: 'Young',
      tags: ['React', '最佳实践', '前端开发']
    }
  ];

  const baseUrl = 'https://your-site.netlify.app'; // 替换为您的域名

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Young's 个人网站 - 技术博客</title>
    <description>分享前端开发技术见解、React、Next.js、TypeScript等技术文章</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/.netlify/functions/feed" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${post.author}</author>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
    </item>`).join('')}
  </channel>
</rss>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    },
    body: rssXml
  };
}; 