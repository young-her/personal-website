import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type BlogPostMeta } from '@/lib/blog'

interface BlogCardProps {
  post: BlogPostMeta
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
            <Link 
              href={`/blog/${post.slug}`} 
              className="hover:underline"
            >
              {post.title}
            </Link>
          </CardTitle>
          
          <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.description}
          </CardDescription>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <time dateTime={post.date}>{formattedDate}</time>
          </div>
          
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{post.author}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.readingTime} 分钟阅读</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Read More Link */}
        <div className="pt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            阅读全文
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 