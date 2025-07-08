import toolsData from '../../data/tools.json'

// Type definitions
export interface Tool {
  id: string
  name: string
  description: string
  url: string
  category: string
  tags: string[]
  featured: boolean
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
}

export interface ToolsData {
  categories: Category[]
  tools: Tool[]
}

// Get all categories
export function getCategories(): Category[] {
  return toolsData.categories
}

// Get all tools
export function getAllTools(): Tool[] {
  return toolsData.tools
}

// Get featured tools
export function getFeaturedTools(): Tool[] {
  return toolsData.tools.filter(tool => tool.featured)
}

// Get tools by category
export function getToolsByCategory(categoryId: string): Tool[] {
  return toolsData.tools.filter(tool => tool.category === categoryId)
}

// Search tools by name, description, or tags
export function searchTools(query: string): Tool[] {
  if (!query.trim()) {
    return getAllTools()
  }

  const lowerQuery = query.toLowerCase()
  
  return toolsData.tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

// Get category by id
export function getCategoryById(categoryId: string): Category | undefined {
  return toolsData.categories.find(cat => cat.id === categoryId)
}

// Get tool by id
export function getToolById(toolId: string): Tool | undefined {
  return toolsData.tools.find(tool => tool.id === toolId)
}

// Filter tools by multiple criteria
export function filterTools({
  category,
  featured,
  searchQuery,
}: {
  category?: string
  featured?: boolean
  searchQuery?: string
}): Tool[] {
  let filteredTools = getAllTools()

  // Filter by category
  if (category && category !== 'all') {
    filteredTools = filteredTools.filter(tool => tool.category === category)
  }

  // Filter by featured status
  if (featured !== undefined) {
    filteredTools = filteredTools.filter(tool => tool.featured === featured)
  }

  // Filter by search query
  if (searchQuery && searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase()
    filteredTools = filteredTools.filter(tool => 
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  return filteredTools
} 