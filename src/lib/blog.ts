import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

// Blog post metadata interface
export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  published: boolean
  content: string
  readingTime: number
}

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  published: boolean
  readingTime: number
}

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return readingTime
}

// Get all blog post slugs
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(name => name.endsWith('.mdx'))
    .map(name => name.replace(/\.mdx$/, ''));
}

// Get blog post by slug
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    
    if (!fs.existsSync(fullPath)) {
      return null
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Calculate reading time
    const readingTime = calculateReadingTime(content)
    
    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      author: data.author || 'Anonymous',
      tags: data.tags || [],
      published: data.published !== false, // Default to true
      content,
      readingTime,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

// Get all blog posts metadata (without content)
export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs()
  
  const posts = slugs
    .map(slug => {
      const post = getPostBySlug(slug)
      if (!post) return null
      
      // Return metadata only (without content)
      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        author: post.author,
        tags: post.tags,
        published: post.published,
        readingTime: post.readingTime,
      }
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .filter(post => post.published) // Only published posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date desc
  
  return posts
}

// Get published posts only
export function getPublishedPosts(): BlogPostMeta[] {
  return getAllPosts().filter(post => post.published)
}

// Get posts by tag
export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter(post => 
    post.tags.some(postTag => 
      postTag.toLowerCase().includes(tag.toLowerCase())
    )
  )
}

// Search posts by title, description, or tags
export function searchPosts(query: string): BlogPostMeta[] {
  if (!query.trim()) {
    return getAllPosts()
  }
  
  const lowerQuery = query.toLowerCase()
  
  return getAllPosts().filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.description.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

// Get all unique tags
export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tagSet = new Set<string>()
  
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag))
  })
  
  return Array.from(tagSet).sort()
}

// Get recent posts (limit)
export function getRecentPosts(limit: number = 5): BlogPostMeta[] {
  return getAllPosts().slice(0, limit)
}

// Get related posts by tags
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPostMeta[] {
  const currentPost = getPostBySlug(currentSlug)
  if (!currentPost) return []
  
  const allPosts = getAllPosts().filter(post => post.slug !== currentSlug)
  
  // Score posts by tag similarity
  const scoredPosts = allPosts.map(post => {
    const commonTags = post.tags.filter(tag => 
      currentPost.tags.includes(tag)
    )
    return {
      post,
      score: commonTags.length
    }
  })
  
  // Sort by score and return top results
  return scoredPosts
    .filter(item => item.score > 0) // Only posts with common tags
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
} 