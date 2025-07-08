import { getCategories, getAllTools, getFeaturedTools } from '@/lib/tools'
import { ToolsPageClient } from '@/components/tools/tools-page-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '工具导航',
  description: '精心收集的前端开发工具和实用资源导航。包含代码编辑器、设计工具、部署平台、学习资源等开发者必备工具，提升开发效率和工作体验。',
  keywords: [
    '开发工具', '前端工具', '代码编辑器', 'VS Code', '设计工具', 'Figma',
    '部署工具', 'Vercel', 'Netlify', '学习资源', '开发资源', '工具导航',
    '效率工具', 'Web开发工具', '编程工具'
  ],
  openGraph: {
    title: '工具导航 | Young\'s 个人网站',
    description: '精心收集的前端开发工具和实用资源导航，提升开发效率的必备工具集合。',
    type: 'website',
    url: '/tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: '工具导航 | Young\'s 个人网站',
    description: '精心收集的前端开发工具和实用资源导航。',
  },
  alternates: {
    canonical: '/tools',
  },
}

export default function ToolsPage() {
  // Get static data
  const categories = getCategories()
  const featuredTools = getFeaturedTools()
  const allTools = getAllTools()

  return (
    <ToolsPageClient
      categories={categories}
      featuredTools={featuredTools}
      allTools={allTools}
    />
  )
}