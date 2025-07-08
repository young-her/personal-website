import { getAllPosts, getAllTags } from '@/lib/blog'
import { BlogList } from '@/components/blog/blog-list'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '技术博客',
  description: '分享前端开发技术见解、React、Next.js、TypeScript等技术文章，记录开发经验和最佳实践。涵盖Web开发、性能优化、工程化等多个技术领域。',
  keywords: [
    '技术博客', '前端开发', 'React', 'Next.js', 'TypeScript', 'JavaScript',
    'Web开发', '编程技术', '开发经验', '最佳实践', '性能优化', '工程化'
  ],
  openGraph: {
    title: '技术博客 | Young\'s 个人网站',
    description: '分享前端开发技术见解、React、Next.js、TypeScript等技术文章，记录开发经验和最佳实践。',
    type: 'website',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: '技术博客 | Young\'s 个人网站',
    description: '分享前端开发技术见解、React、Next.js、TypeScript等技术文章。',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const tags = getAllTags()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">博客</h1>
          <p className="text-xl text-muted-foreground">
            分享技术见解和开发经验
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">热门标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 10).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blog Posts */}
      <BlogList posts={posts} />
    </div>
  )
} 