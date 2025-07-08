import { CodeBlock, InlineCode } from './code-block'
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 代码块映射
    pre: ({ children, ...props }) => {
      // 从 children 中提取 code 元素和其属性
      const codeElement = children as React.ReactElement<{ className?: string; children: React.ReactNode }>
      const language = codeElement?.props?.className?.replace('language-', '') || 'plaintext'
      const code = codeElement?.props?.children || children
      
      return (
        <CodeBlock language={language} {...props}>
          {code}
        </CodeBlock>
      )
    },
    
    // 行内代码映射
    code: ({ children, className, ...props }) => {
      // 如果在 pre 标签内，返回原始 code 元素
      if (className?.includes('language-')) {
        return <code className={className} {...props}>{children}</code>
      }
      
      // 否则使用我们的行内代码组件
      return <InlineCode {...props}>{children}</InlineCode>
    },
    
    ...components,
  }
} 