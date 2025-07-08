import { BlogCard } from './blog-card'
import { type BlogPostMeta } from '@/lib/blog'

interface BlogListProps {
  posts: BlogPostMeta[]
  title?: string
  showCount?: boolean
}

export function BlogList({ posts, title, showCount = true }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            暂无博客文章
          </h3>
          <p className="text-sm text-muted-foreground">
            敬请期待更多精彩内容
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
          {showCount && (
            <p className="text-muted-foreground">
              共 {posts.length} 篇文章
            </p>
          )}
        </div>
      )}
      
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
} 