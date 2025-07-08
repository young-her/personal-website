'use client'

import React, { useState, useRef } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ 
  children, 
  language = 'plaintext', 
  title, 
  showLineNumbers = false,
  className 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const handleCopy = async () => {
    if (codeRef.current) {
      const text = codeRef.current.textContent || ''
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy text:', error)
      }
    }
  }

  const getLanguageDisplayName = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'jsx': 'JSX',
      'tsx': 'TSX',
      'python': 'Python',
      'bash': 'Bash',
      'shell': 'Shell',
      'json': 'JSON',
      'css': 'CSS',
      'html': 'HTML',
      'markdown': 'Markdown',
      'sql': 'SQL',
      'yaml': 'YAML',
      'dockerfile': 'Dockerfile',
      'plaintext': 'Text'
    }
    return langMap[lang.toLowerCase()] || lang.toUpperCase()
  }

  return (
    <div className={cn("group relative my-6", className)}>
      {/* macOS 风格的窗口标题栏 */}
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-3 rounded-t-lg border border-gray-700 dark:border-gray-600">
        {/* 左侧：三个圆点 */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        
        {/* 中间：标题或语言 */}
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-gray-300 dark:text-gray-400">
            {title || getLanguageDisplayName(language)}
          </span>
        </div>
        
        {/* 右侧：复制按钮 */}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="复制代码"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-200" />
          )}
        </button>
      </div>
      
      {/* 代码内容区域 */}
      <div className="relative">
        <pre className={cn(
          "!mt-0 !rounded-t-none !rounded-b-lg !border-t-0",
          "bg-gray-900 dark:bg-black",
          "border border-gray-700 dark:border-gray-600",
          "overflow-x-auto",
          "text-sm leading-6",
          showLineNumbers && "pl-12"
        )}>
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-800 dark:bg-gray-900 border-r border-gray-700 dark:border-gray-600 flex flex-col text-gray-500 text-xs font-mono">
              {/* 行号将通过CSS计数器或JS生成 */}
            </div>
          )}
          <code ref={codeRef} className={cn(
            "block p-4",
            `language-${language}`,
            "text-gray-100 dark:text-gray-200"
          )}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  )
}

// 用于行内代码的组件
export function InlineCode({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <code className={cn(
      "px-1.5 py-0.5 rounded-md text-sm font-mono",
      "bg-gray-100 dark:bg-gray-800", 
      "text-gray-800 dark:text-gray-200",
      "border border-gray-200 dark:border-gray-700",
      className
    )}>
      {children}
    </code>
  )
} 