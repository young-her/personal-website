import { ToolCard } from './tool-card'
import { type Tool } from '@/lib/tools'

interface ToolsGridProps {
  tools: Tool[]
  title?: string
}

export function ToolsGrid({ tools, title }: ToolsGridProps) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            没有找到匹配的工具
          </h3>
          <p className="text-sm text-muted-foreground">
            尝试调整搜索条件或选择不同的分类
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            共 {tools.length} 个工具
          </p>
        </div>
      )}
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
} 