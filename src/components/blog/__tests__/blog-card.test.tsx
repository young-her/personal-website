import { render, screen } from '@/lib/test-utils'
import { BlogCard } from '../blog-card'
import { createMockPost } from '@/lib/test-utils'

describe('BlogCard', () => {
  const mockPost = createMockPost({
    slug: 'test-post',
    title: 'Test Blog Post',
    description: 'This is a test blog post description',
    date: '2024-01-15',
    author: 'John Doe',
    tags: ['react', 'testing', 'jest'],
    readingTime: 5,
  })

  it('renders blog post information correctly', () => {
    render(<BlogCard post={mockPost} />)
    
    // Check if title is rendered
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
    
    // Check if description is rendered
    expect(screen.getByText('This is a test blog post description')).toBeInTheDocument()
    
    // Check if author is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    
    // Check if reading time is rendered
    expect(screen.getByText('5 分钟阅读')).toBeInTheDocument()
  })

  it('renders publication date correctly', () => {
    render(<BlogCard post={mockPost} />)
    
    // Check if date is formatted correctly
    expect(screen.getByText('2024年1月15日')).toBeInTheDocument()
  })

  it('renders all tags', () => {
    render(<BlogCard post={mockPost} />)
    
    // Check if all tags are rendered
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.getByText('jest')).toBeInTheDocument()
  })

  it('has correct link to blog post', () => {
    render(<BlogCard post={mockPost} />)
    
    // Check if card links to correct blog post
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/blog/test-post')
  })

  it('displays calendar and clock icons', () => {
    render(<BlogCard post={mockPost} />)
    
    // Check if icons are present
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('handles long titles gracefully', () => {
    const longTitlePost = createMockPost({
      title: 'This is a very long blog post title that should be handled gracefully by the component',
    })
    
    render(<BlogCard post={longTitlePost} />)
    
    const title = screen.getByText(longTitlePost.title)
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('line-clamp-2') // Assuming title is clamped
  })

  it('handles long descriptions gracefully', () => {
    const longDescPost = createMockPost({
      description: 'This is a very long description that should be truncated or handled gracefully by the component to ensure good user experience and proper layout',
    })
    
    render(<BlogCard post={longDescPost} />)
    
    const description = screen.getByText(longDescPost.description)
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('line-clamp-3') // Assuming description is clamped
  })

  it('handles posts with no tags', () => {
    const noTagsPost = createMockPost({
      tags: [],
    })
    
    render(<BlogCard post={noTagsPost} />)
    
    // Should still render without errors
    expect(screen.getByText(noTagsPost.title)).toBeInTheDocument()
    
    // Tags section should not be visible or should be empty
    const tagsContainer = screen.queryByTestId('tags-container')
    if (tagsContainer) {
      expect(tagsContainer).toBeEmptyDOMElement()
    }
  })

  it('is accessible', () => {
    render(<BlogCard post={mockPost} />)
    
    // Card should be a clickable element
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    
    // Should have accessible name
    expect(link).toHaveAccessibleName()
    
    // Should be keyboard navigable
    expect(link).not.toHaveAttribute('tabindex', '-1')
  })

  it('has hover effects', () => {
    render(<BlogCard post={mockPost} />)
    
    const card = screen.getByRole('link')
    
    // Card should have hover classes
    expect(card).toHaveClass('hover:shadow-lg')
    expect(card).toHaveClass('transition-shadow')
  })

  it('formats reading time correctly', () => {
    const oneMinutePost = createMockPost({ readingTime: 1 })
    const { rerender } = render(<BlogCard post={oneMinutePost} />)
    
    expect(screen.getByText('1 分钟阅读')).toBeInTheDocument()
    
    const tenMinutePost = createMockPost({ readingTime: 10 })
    rerender(<BlogCard post={tenMinutePost} />)
    
    expect(screen.getByText('10 分钟阅读')).toBeInTheDocument()
  })

  it('handles special characters in content', () => {
    const specialCharPost = createMockPost({
      title: 'Test & Special <Characters> "Quotes"',
      description: 'Description with & special <characters> and "quotes"',
      author: 'Author & Co.',
    })
    
    render(<BlogCard post={specialCharPost} />)
    
    // Should render special characters correctly
    expect(screen.getByText('Test & Special <Characters> "Quotes"')).toBeInTheDocument()
    expect(screen.getByText('Description with & special <characters> and "quotes"')).toBeInTheDocument()
    expect(screen.getByText('Author & Co.')).toBeInTheDocument()
  })
})
