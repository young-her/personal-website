'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  className?: string
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from the page
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ).filter(heading => heading.id) // Only headings with IDs

    const tocItems: TocItem[] = headings.map(heading => ({
      id: heading.id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
    }))

    setToc(tocItems)

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    )

    headings.forEach((heading) => observer.observe(heading))

    return () => {
      headings.forEach((heading) => observer.unobserve(heading))
    }
  }, [])

  if (toc.length === 0) {
    return null
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <nav className={cn('space-y-2', className)}>
      <h4 className="text-sm font-semibold text-foreground mb-4">目录</h4>
      <ul className="space-y-2 text-sm">
        {toc.map((item) => (
          <li
            key={item.id}
            className={cn(
              'transition-colors hover:text-foreground cursor-pointer',
              item.level === 1 && 'font-medium',
              item.level === 2 && 'pl-3',
              item.level === 3 && 'pl-6',
              item.level === 4 && 'pl-9',
              item.level >= 5 && 'pl-12',
              activeId === item.id
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            )}
            onClick={() => scrollToHeading(item.id)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </nav>
  )
} 