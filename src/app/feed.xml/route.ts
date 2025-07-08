import { getAllPosts } from '@/lib/blog'

export async function GET() {
  const baseUrl = 'http://localhost:3000'
  const posts = getAllPosts()

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Young's 个人网站 - 技术博客</title>
    <description>分享前端开发技术见解、React、Next.js、TypeScript等技术文章，记录开发经验和最佳实践。</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <managingEditor>young@example.com (Young)</managingEditor>
    <webMaster>young@example.com (Young)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>young@example.com (${post.author})</author>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
  })
}
