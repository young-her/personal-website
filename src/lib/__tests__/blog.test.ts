import { getAllPosts, getAllTags, getPostBySlug, getRelatedPosts } from '../blog'

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
}))

// Mock gray-matter
jest.mock('gray-matter', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockFs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockMatter = require('gray-matter').default

describe('Blog Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllPosts', () => {
    it('returns empty array when no posts exist', () => {
      mockFs.existsSync.mockReturnValue(false)
      
      const posts = getAllPosts()
      expect(posts).toEqual([])
    })

    it('returns posts sorted by date (newest first)', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.md', 'not-a-post.txt'])
      
      mockFs.readFileSync
        .mockReturnValueOnce('content1')
        .mockReturnValueOnce('content2')
      
      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Post 1',
            date: '2024-01-01',
            description: 'Description 1',
            author: 'Author 1',
            tags: ['tag1'],
          },
          content: 'Content 1',
        })
        .mockReturnValueOnce({
          data: {
            title: 'Post 2',
            date: '2024-01-02',
            description: 'Description 2',
            author: 'Author 2',
            tags: ['tag2'],
          },
          content: 'Content 2',
        })

      const posts = getAllPosts()
      
      expect(posts).toHaveLength(2)
      expect(posts[0].title).toBe('Post 2') // Newer post first
      expect(posts[1].title).toBe('Post 1')
    })

    it('filters out non-markdown files', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.md', 'readme.txt', 'image.jpg'])
      
      mockFs.readFileSync
        .mockReturnValueOnce('content1')
        .mockReturnValueOnce('content2')
      
      mockMatter
        .mockReturnValueOnce({
          data: { title: 'Post 1', date: '2024-01-01', description: '', author: '', tags: [] },
          content: 'Content 1',
        })
        .mockReturnValueOnce({
          data: { title: 'Post 2', date: '2024-01-02', description: '', author: '', tags: [] },
          content: 'Content 2',
        })

      const posts = getAllPosts()
      
      expect(posts).toHaveLength(2)
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2)
    })

    it('calculates reading time correctly', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx'])
      
      const longContent = 'word '.repeat(1000) // 1000 words
      mockFs.readFileSync.mockReturnValueOnce('content')
      
      mockMatter.mockReturnValueOnce({
        data: {
          title: 'Long Post',
          date: '2024-01-01',
          description: 'A long post',
          author: 'Author',
          tags: [],
        },
        content: longContent,
      })

      const posts = getAllPosts()
      
      expect(posts[0].readingTime).toBe(5) // 1000 words / 200 words per minute = 5 minutes
    })
  })

  describe('getAllTags', () => {
    it('returns unique tags from all posts', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.mdx'])
      
      mockFs.readFileSync
        .mockReturnValueOnce('content1')
        .mockReturnValueOnce('content2')
      
      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Post 1',
            date: '2024-01-01',
            description: '',
            author: '',
            tags: ['react', 'javascript'],
          },
          content: '',
        })
        .mockReturnValueOnce({
          data: {
            title: 'Post 2',
            date: '2024-01-02',
            description: '',
            author: '',
            tags: ['javascript', 'typescript'],
          },
          content: '',
        })

      const tags = getAllTags()
      
      expect(tags).toEqual(['react', 'javascript', 'typescript'])
      expect(tags).toHaveLength(3) // No duplicates
    })

    it('returns empty array when no posts have tags', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx'])
      
      mockFs.readFileSync.mockReturnValueOnce('content')
      
      mockMatter.mockReturnValueOnce({
        data: {
          title: 'Post 1',
          date: '2024-01-01',
          description: '',
          author: '',
          tags: [],
        },
        content: '',
      })

      const tags = getAllTags()
      
      expect(tags).toEqual([])
    })
  })

  describe('getPostBySlug', () => {
    it('returns post when found', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('content')
      
      mockMatter.mockReturnValue({
        data: {
          title: 'Test Post',
          date: '2024-01-01',
          description: 'Test description',
          author: 'Test Author',
          tags: ['test'],
        },
        content: 'Test content',
      })

      const post = getPostBySlug('test-post')
      
      expect(post).toBeDefined()
      expect(post?.title).toBe('Test Post')
      expect(post?.slug).toBe('test-post')
    })

    it('returns null when post not found', () => {
      mockFs.existsSync.mockReturnValue(false)
      
      const post = getPostBySlug('non-existent-post')
      
      expect(post).toBeNull()
    })

    it('tries both .mdx and .md extensions', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // .mdx doesn't exist
        .mockReturnValueOnce(true)  // .md exists
      
      mockFs.readFileSync.mockReturnValue('content')
      mockMatter.mockReturnValue({
        data: {
          title: 'Test Post',
          date: '2024-01-01',
          description: '',
          author: '',
          tags: [],
        },
        content: '',
      })

      const post = getPostBySlug('test-post')
      
      expect(post).toBeDefined()
      expect(mockFs.existsSync).toHaveBeenCalledTimes(2)
    })
  })

  describe('getRelatedPosts', () => {
    beforeEach(() => {
      // Mock getAllPosts for related posts tests
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['post1.mdx', 'post2.mdx', 'post3.mdx', 'post4.mdx'])
      
      mockFs.readFileSync
        .mockReturnValue('content')
      
      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Post 1',
            date: '2024-01-01',
            description: '',
            author: '',
            tags: ['react', 'javascript'],
          },
          content: '',
        })
        .mockReturnValueOnce({
          data: {
            title: 'Post 2',
            date: '2024-01-02',
            description: '',
            author: '',
            tags: ['react', 'typescript'],
          },
          content: '',
        })
        .mockReturnValueOnce({
          data: {
            title: 'Post 3',
            date: '2024-01-03',
            description: '',
            author: '',
            tags: ['vue', 'javascript'],
          },
          content: '',
        })
        .mockReturnValueOnce({
          data: {
            title: 'Post 4',
            date: '2024-01-04',
            description: '',
            author: '',
            tags: ['angular'],
          },
          content: '',
        })
    })

    it('returns posts with shared tags', () => {
      const currentPost = {
        slug: 'post1',
        title: 'Post 1',
        date: '2024-01-01',
        description: '',
        author: '',
        tags: ['react', 'javascript'],
        readingTime: 5,
        content: '',
      }

      const relatedPosts = getRelatedPosts(currentPost, 3)
      
      expect(relatedPosts).toHaveLength(2) // Post 2 and Post 3 share tags
      expect(relatedPosts.find(p => p.slug === 'post2')).toBeDefined() // Shares 'react'
      expect(relatedPosts.find(p => p.slug === 'post3')).toBeDefined() // Shares 'javascript'
      expect(relatedPosts.find(p => p.slug === 'post1')).toBeUndefined() // Excludes current post
    })

    it('limits results to specified count', () => {
      const currentPost = {
        slug: 'post1',
        title: 'Post 1',
        date: '2024-01-01',
        description: '',
        author: '',
        tags: ['react', 'javascript'],
        readingTime: 5,
        content: '',
      }

      const relatedPosts = getRelatedPosts(currentPost, 1)
      
      expect(relatedPosts).toHaveLength(1)
    })

    it('returns empty array when no related posts found', () => {
      const currentPost = {
        slug: 'post4',
        title: 'Post 4',
        date: '2024-01-04',
        description: '',
        author: '',
        tags: ['unique-tag'],
        readingTime: 5,
        content: '',
      }

      const relatedPosts = getRelatedPosts(currentPost, 3)
      
      expect(relatedPosts).toHaveLength(0)
    })
  })
})
