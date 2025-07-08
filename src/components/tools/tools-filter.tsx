'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type Category } from '@/lib/tools'

interface ToolsFilterProps {
  categories: Category[]
  selectedCategory: string
  searchQuery: string
  onCategoryChange: (category: string) => void
  onSearchChange: (query: string) => void
  resultCount: number
}

export function ToolsFilter({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  resultCount,
}: ToolsFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearch)
  }

  const clearSearch = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  const clearCategory = () => {
    onCategoryChange('all')
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">搜索工具</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索工具名称、描述或标签..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {localSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">分类筛选</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange('all')}
                className="text-xs"
              >
                全部
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="text-xs"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">当前筛选</h3>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    搜索: &ldquo;{searchQuery}&rdquo;
                    <button
                      onClick={clearSearch}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    分类: {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={clearCategory}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Result Count */}
          <div className="text-sm text-muted-foreground">
            找到 {resultCount} 个工具
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 