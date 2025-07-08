import { ExternalLink, Star } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Tool } from '@/lib/tools'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
            {tool.name}
            {tool.featured && (
              <Star className="inline-block ml-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tool.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tool.tags.length - 2}
              </Badge>
            )}
          </div>
          
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2">
              访问
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
} 