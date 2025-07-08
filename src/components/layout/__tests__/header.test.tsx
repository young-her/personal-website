import { render, screen, fireEvent } from '@/lib/test-utils'
import { Header } from '../header'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}))

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with logo and navigation', () => {
    render(<Header />)
    
    // Check if logo/brand is present
    expect(screen.getByText(/个人网站/i)).toBeInTheDocument()
    
    // Check if main navigation items are present
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('博客')).toBeInTheDocument()
    expect(screen.getByText('工具')).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<Header />)
    
    // Theme toggle should be present
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
  })

  it('renders mobile menu toggle on small screens', () => {
    render(<Header />)
    
    // Mobile menu button should be present
    const mobileMenuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(mobileMenuButton).toBeInTheDocument()
  })

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle menu/i })
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton)
    
    // Mobile menu should be visible
    const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i })
    expect(mobileNav).toBeInTheDocument()
    
    // Click to close mobile menu
    fireEvent.click(mobileMenuButton)
    
    // Mobile menu should be hidden
    expect(mobileNav).not.toBeInTheDocument()
  })

  it('has correct navigation links', () => {
    render(<Header />)
    
    // Check if navigation links have correct href attributes
    const homeLink = screen.getByRole('link', { name: '首页' })
    const blogLink = screen.getByRole('link', { name: '博客' })
    const toolsLink = screen.getByRole('link', { name: '工具' })
    
    expect(homeLink).toHaveAttribute('href', '/')
    expect(blogLink).toHaveAttribute('href', '/blog')
    expect(toolsLink).toHaveAttribute('href', '/tools')
  })

  it('applies active state to current page link', () => {
    render(<Header />)
    
    // Home link should have active styling when on home page
    const homeLink = screen.getByRole('link', { name: '首页' })
    expect(homeLink).toHaveClass('text-foreground')
  })

  it('is accessible', () => {
    render(<Header />)
    
    // Header should have proper landmark role
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // Navigation should have proper role
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // All interactive elements should be focusable
    const links = screen.getAllByRole('link')
    const buttons = screen.getAllByRole('button')
    
    links.forEach(link => {
      expect(link).not.toHaveAttribute('tabindex', '-1')
    })
    
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })

  it('handles keyboard navigation', () => {
    render(<Header />)
    
    const firstLink = screen.getByRole('link', { name: '首页' })
    
    // Focus first link
    firstLink.focus()
    expect(firstLink).toHaveFocus()
    
    // Tab to next element
    fireEvent.keyDown(firstLink, { key: 'Tab' })
    
    // Should move focus to next focusable element
    const nextElement = screen.getByRole('link', { name: '博客' })
    expect(nextElement).toHaveFocus()
  })
})
