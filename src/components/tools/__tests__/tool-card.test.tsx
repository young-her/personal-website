import { render, screen } from '@/lib/test-utils'
import { ToolCard } from '../tool-card'
import { createMockTool } from '@/lib/test-utils'

describe('ToolCard', () => {
  const mockTool = createMockTool({
    id: 'vscode',
    name: 'Visual Studio Code',
    description: 'A powerful code editor',
    url: 'https://code.visualstudio.com',
    category: 'editor',
    featured: true,
    tags: ['editor', 'microsoft', 'free'],
  })

  it('renders tool information correctly', () => {
    render(<ToolCard tool={mockTool} />)
    
    // Check if name is rendered
    expect(screen.getByText('Visual Studio Code')).toBeInTheDocument()
    
    // Check if description is rendered
    expect(screen.getByText('A powerful code editor')).toBeInTheDocument()
  })

  it('has correct external link', () => {
    render(<ToolCard tool={mockTool} />)
    
    // Check if card links to correct URL
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://code.visualstudio.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('displays external link icon', () => {
    render(<ToolCard tool={mockTool} />)
    
    // Check if external link icon is present
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument()
  })

  it('renders all tags', () => {
    render(<ToolCard tool={mockTool} />)
    
    // Check if all tags are rendered
    expect(screen.getByText('editor')).toBeInTheDocument()
    expect(screen.getByText('microsoft')).toBeInTheDocument()
    expect(screen.getByText('free')).toBeInTheDocument()
  })

  it('shows featured badge for featured tools', () => {
    render(<ToolCard tool={mockTool} />)
    
    // Check if featured badge is present
    expect(screen.getByText('精选')).toBeInTheDocument()
  })

  it('does not show featured badge for non-featured tools', () => {
    const nonFeaturedTool = createMockTool({
      featured: false,
    })
    
    render(<ToolCard tool={nonFeaturedTool} />)
    
    // Check if featured badge is not present
    expect(screen.queryByText('精选')).not.toBeInTheDocument()
  })

  it('handles tools with no tags', () => {
    const noTagsTool = createMockTool({
      tags: [],
    })
    
    render(<ToolCard tool={noTagsTool} />)
    
    // Should still render without errors
    expect(screen.getByText(noTagsTool.name)).toBeInTheDocument()
    
    // Tags section should not be visible or should be empty
    const tagsContainer = screen.queryByTestId('tags-container')
    if (tagsContainer) {
      expect(tagsContainer).toBeEmptyDOMElement()
    }
  })

  it('handles long tool names gracefully', () => {
    const longNameTool = createMockTool({
      name: 'This is a very long tool name that should be handled gracefully',
    })
    
    render(<ToolCard tool={longNameTool} />)
    
    const name = screen.getByText(longNameTool.name)
    expect(name).toBeInTheDocument()
    // Name should be truncated or wrapped appropriately
  })

  it('handles long descriptions gracefully', () => {
    const longDescTool = createMockTool({
      description: 'This is a very long description that should be truncated or handled gracefully by the component to ensure good user experience',
    })
    
    render(<ToolCard tool={longDescTool} />)
    
    const description = screen.getByText(longDescTool.description)
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('line-clamp-2') // Assuming description is clamped
  })

  it('is accessible', () => {
    render(<ToolCard tool={mockTool} />)
    
    // Card should be a clickable element
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    
    // Should have accessible name
    expect(link).toHaveAccessibleName()
    
    // Should be keyboard navigable
    expect(link).not.toHaveAttribute('tabindex', '-1')
    
    // External link should have proper accessibility attributes
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('opens in new tab'))
  })

  it('has hover effects', () => {
    render(<ToolCard tool={mockTool} />)
    
    const card = screen.getByRole('link')
    
    // Card should have hover classes
    expect(card).toHaveClass('hover:shadow-lg')
    expect(card).toHaveClass('transition-all')
  })

  it('handles special characters in content', () => {
    const specialCharTool = createMockTool({
      name: 'Tool & Special <Characters>',
      description: 'Description with & special <characters> and "quotes"',
    })
    
    render(<ToolCard tool={specialCharTool} />)
    
    // Should render special characters correctly
    expect(screen.getByText('Tool & Special <Characters>')).toBeInTheDocument()
    expect(screen.getByText('Description with & special <characters> and "quotes"')).toBeInTheDocument()
  })

  it('validates URL format', () => {
    const validUrlTool = createMockTool({
      url: 'https://example.com',
    })
    
    render(<ToolCard tool={validUrlTool} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('handles different URL protocols', () => {
    const httpTool = createMockTool({
      url: 'http://example.com',
    })
    
    render(<ToolCard tool={httpTool} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'http://example.com')
  })
})
