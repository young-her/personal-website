import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { mdxSanitizeSchema, validateSlug, sanitizeFileName } from './security'

// Blog post metadata interface
export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author?: string
  tags?: string[]
  published?: boolean
  content: string
  readingTime?: number
}

// MDX compilation options with enhanced security
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [rehypeSanitize, mdxSanitizeSchema] as any, // Enhanced security: sanitize HTML with custom schema
      rehypeHighlight, // Code syntax highlighting
    ],
  },
}

// Get content directory path
const contentDirectory = path.join(process.cwd(), 'content')

// Read all blog posts from content/blog directory
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const blogDirectory = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(blogDirectory)
  const posts = await Promise.all(
    fileNames
      .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.(mdx|md)$/, '')
        return await getBlogPostBySlug(slug)
      })
  )

  // Filter out null posts and sort by date
  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Get a specific blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Security: Validate slug format to prevent path traversal
    if (!validateSlug(slug)) {
      console.warn(`Invalid slug format: ${slug}`)
      return null
    }

    const blogDirectory = path.join(contentDirectory, 'blog')

    // Try both .mdx and .md extensions
    let fullPath: string
    let fileExists = false

    for (const ext of ['.mdx', '.md']) {
      const fileName = sanitizeFileName(`${slug}${ext}`)
      fullPath = path.join(blogDirectory, fileName)
      if (fs.existsSync(fullPath)) {
        fileExists = true
        break
      }
    }
    
    if (!fileExists) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath!, 'utf8')
    const { data, content } = matter(fileContents)

    // Validate required frontmatter
    if (!data.title || !data.date) {
      console.warn(`Blog post ${slug} is missing required frontmatter (title, date)`)
      return null
    }

    // Calculate reading time (approximate)
    const readingTime = Math.ceil(content.split(' ').length / 200)

    return {
      slug,
      title: data.title,
      description: data.description || '',
      date: data.date,
      author: data.author,
      tags: data.tags || [],
      published: data.published !== false, // Default to true
      content,
      readingTime,
    }
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

// Compile MDX content to React component
export async function compileBlogPost(post: BlogPost) {
  try {
    const { content, frontmatter } = await compileMDX({
      source: post.content,
      options: mdxOptions,
    })

    return {
      content,
      frontmatter: { ...post, ...frontmatter },
    }
  } catch (error) {
    console.error(`Error compiling MDX for ${post.slug}:`, error)
    throw error
  }
}

// Get blog post slugs for static generation
export function getBlogPostSlugs(): string[] {
  const blogDirectory = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDirectory)) {
    return []
  }

  return fs
    .readdirSync(blogDirectory)
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((name) => name.replace(/\.(mdx|md)$/, ''));
} 