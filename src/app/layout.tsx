import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WebsiteStructuredData } from '@/components/seo/structured-data'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'Young\'s 个人网站 - 前端开发者的技术分享平台',
    template: '%s | Young\'s 个人网站'
  },
  description: '欢迎来到Young的个人网站！这里分享前端开发技术、React、Next.js、TypeScript等技术文章，收录精选开发工具和实用资源。专注于现代Web开发技术分享和经验总结。',
  keywords: [
    'Young', '个人网站', '前端开发', 'React', 'Next.js', 'TypeScript',
    'JavaScript', 'Web开发', '技术博客', '开发工具', '编程',
    '前端技术', 'UI/UX', '响应式设计', '性能优化', 'SEO优化'
  ],
  authors: [{ name: 'Young', url: 'http://localhost:3000' }],
  creator: 'Young',
  publisher: 'Young\'s 个人网站',
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: 'http://localhost:3000',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'http://localhost:3000',
    title: 'Young\'s 个人网站 - 前端开发者的技术分享平台',
    description: '欢迎来到Young的个人网站！分享前端开发技术、React、Next.js等技术文章，收录精选开发工具和实用资源。',
    siteName: 'Young\'s 个人网站',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Young\'s 个人网站 - 前端开发技术分享',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Young\'s 个人网站 - 前端开发者的技术分享平台',
    description: '分享前端开发技术、React、Next.js等技术文章，收录精选开发工具和实用资源。',
    images: ['/og-image.png'],
    creator: '@young_dev',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <head>
        <WebsiteStructuredData
          url="http://localhost:3000"
          name="Young's 个人网站"
          description="欢迎来到Young的个人网站！分享前端开发技术、React、Next.js等技术文章，收录精选开发工具和实用资源。"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
