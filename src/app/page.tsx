import Link from 'next/link'
import { ArrowRight, Code, Palette, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFeaturedTools } from '@/lib/tools'
import { getRecentPosts } from '@/lib/blog'
import { ToolCard } from '@/components/tools/tool-card'
import { BlogCard } from '@/components/blog/blog-card'

export default function HomePage() {
  const featuredTools = getFeaturedTools().slice(0, 3)
  const recentPosts = getRecentPosts(3)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              欢迎来到我的
              <span className="text-primary"> 数字世界</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              这里是我分享技术见解、记录开发经验，以及收集实用工具的个人空间
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/blog">
                探索博客
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link href="/tools">
                浏览工具
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">主要功能</h2>
            <p className="text-muted-foreground text-lg">
              发现和分享有价值的内容
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>技术博客</CardTitle>
                <CardDescription>
                  分享前端开发、技术思考和实践经验
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild>
                  <Link href="/blog">阅读文章</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>工具导航</CardTitle>
                <CardDescription>
                  精心收集的开发工具和实用资源
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild>
                  <Link href="/tools">查看工具</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>现代设计</CardTitle>
                <CardDescription>
                  简洁优雅的界面，流畅的用户体验
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild>
                  <Link href="/about">了解更多</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Recent Blog Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">最新文章</h2>
                <p className="text-muted-foreground">
                  最近发布的技术文章和见解
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/blog">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">精选工具</h2>
                <p className="text-muted-foreground">
                  开发过程中最常用的工具和资源
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/tools">
                  探索更多
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
