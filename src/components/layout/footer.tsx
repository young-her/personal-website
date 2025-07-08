import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        {/* Copyright */}
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} 个人网站. 使用{' '}
            <Link
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Next.js
            </Link>{' '}
            构建.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          
          <Separator orientation="vertical" className="h-5" />
          
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          
          <Separator orientation="vertical" className="h-5" />
          
          <Link
            href="mailto:contact@example.com"
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">邮箱</span>
          </Link>
        </div>
      </div>
    </footer>
  );
} 