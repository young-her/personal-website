import Link from 'next/link'
import { Home, BookOpen, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">Y</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              个人网站
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            首页
          </Link>
          <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">
            博客
          </Link>
          <Link href="/tools" className="transition-colors hover:text-foreground/80 text-foreground/60">
            工具
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Navigation */}
          <div className="flex md:hidden space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tools">
                <Wrench className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 