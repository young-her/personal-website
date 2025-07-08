import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getAllTools } from '@/lib/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'http://localhost:3000'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Blog posts
  const posts = getAllPosts()
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Tools (if they have individual pages)
  const tools = getAllTools()
  const toolPages = tools
    .filter(tool => tool.featured) // Only include featured tools or add individual tool pages if needed
    .map((tool) => ({
      url: `${baseUrl}/tools#${tool.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))

  return [...staticPages, ...blogPages, ...toolPages]
}
