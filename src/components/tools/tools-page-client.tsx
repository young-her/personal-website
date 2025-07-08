'use client'

import { useState, useMemo } from 'react'
import { ToolsFilter } from '@/components/tools/tools-filter'
import { ToolsGrid } from '@/components/tools/tools-grid'
import { Separator } from '@/components/ui/separator'
import { filterTools } from '@/lib/tools'
import type { Tool, Category } from '@/lib/tools'

interface ToolsPageClientProps {
  categories: Category[]
  featuredTools: Tool[]
  allTools: Tool[]
}

export function ToolsPageClient({ categories, featuredTools, allTools }: ToolsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tools based on current state
  const filteredTools = useMemo(() => {
    // Use allTools parameter to ensure we're working with the passed data
    console.log(`Filtering ${allTools.length} tools`)
    return filterTools({
      category: selectedCategory,
      searchQuery: searchQuery,
    })
  }, [selectedCategory, searchQuery, allTools])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">工具导航</h1>
          <p className="text-xl text-muted-foreground">
            精心收集的开发工具和实用资源
          </p>
        </div>
      </div>

      {/* Featured Tools Section */}
      {!searchQuery && selectedCategory === 'all' && (
        <>
          <section className="mb-12">
            <ToolsGrid 
              tools={featuredTools} 
              title="精选工具" 
            />
          </section>
          <Separator className="mb-8" />
        </>
      )}

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <ToolsFilter
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            resultCount={filteredTools.length}
          />
        </aside>

        {/* Main Content - Tools Grid */}
        <main className="lg:col-span-3">
          <ToolsGrid 
            tools={filteredTools}
            title={
              searchQuery || selectedCategory !== 'all' 
                ? '搜索结果' 
                : '所有工具'
            }
          />
        </main>
      </div>
    </div>
  )
}
