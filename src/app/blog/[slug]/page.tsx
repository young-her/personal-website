import { notFound } from 'next/navigation'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'

import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlogCard } from '@/components/blog/blog-card'
import { Separator } from '@/components/ui/separator'
import { BlogPostStructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { mdxSanitizeSchema } from '@/lib/security'
import { CodeBlock, InlineCode } from '@/components/ui/code-block'

import 'highlight.js/styles/tokyo-night-dark.css'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// MDX 组件映射
const mdxComponents = {
  pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => {
    // 从 children 中提取 code 元素和其属性
    const codeElement = children as React.ReactElement<{ className?: string; children: React.ReactNode }>
    const className = codeElement?.props?.className || ''
    const language = className.replace('language-', '') || 'plaintext'
    const code = codeElement?.props?.children || children
    
    return (
      <CodeBlock language={language} {...props}>
        {code}
      </CodeBlock>
    )
  },
  
  code: ({ children, className, ...props }: React.HTMLProps<HTMLElement>) => {
    // 如果在 pre 标签内，返回原始 code 元素
    if (className?.includes('language-')) {
      return <code className={className} {...props}>{children}</code>
    }
    
    // 否则使用我们的行内代码组件
    return <InlineCode {...props}>{children}</InlineCode>
  },
}

// Generate static paths for all blog posts
export function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post || !post.published) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug, 3)
  
  const formattedDate = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        // 使用适当的类型断言
        [rehypeSanitize, mdxSanitizeSchema] as [typeof rehypeSanitize, typeof mdxSanitizeSchema], // Enhanced security with custom schema
        rehypeHighlight,
      ],
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <BlogPostStructuredData
        title={post.title}
        description={post.description}
        url={`http://localhost:3000/blog/${post.slug}`}
        datePublished={post.date}
        author={post.author}
        tags={post.tags}
        readingTime={post.readingTime}
      />
      <BreadcrumbStructuredData
        items={[
          { name: '首页', url: 'http://localhost:3000' },
          { name: '博客', url: 'http://localhost:3000/blog' },
          { name: post.title, url: `http://localhost:3000/blog/${post.slug}` },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" asChild>
            <Link
              href="/blog"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回博客列表
            </Link>
          </Button>
        </div>

        {/* Article Container */}
        <article className="mx-auto max-w-4xl">
          {/* Article Header */}
          <header className="mb-12 space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {post.description}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{formattedDate}</time>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} 分钟阅读</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Separator className="mb-12" />

          {/* Article Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert mx-auto">
            <MDXRemote 
              source={post.content} 
              options={mdxOptions}
              components={mdxComponents}
            />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-20">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">相关文章</CardTitle>
                  <p className="text-muted-foreground">基于标签推荐的相关内容</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.map((relatedPost) => (
                      <BlogCard key={relatedPost.slug} post={relatedPost} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </article>
      </div>
    </div>
  );
} 