interface WebsiteStructuredDataProps {
  url: string
  name: string
  description: string
}

export function WebsiteStructuredData({ url, name, description }: WebsiteStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    author: {
      '@type': 'Person',
      name: 'Young',
      url: url,
    },
    publisher: {
      '@type': 'Person',
      name: 'Young',
      url: url,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface BlogPostStructuredDataProps {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  author: string
  tags: string[]
  readingTime: number
}

export function BlogPostStructuredData({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author,
  tags,
  readingTime,
}: BlogPostStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
      url: 'http://localhost:3000',
    },
    publisher: {
      '@type': 'Person',
      name: 'Young',
      url: 'http://localhost:3000',
    },
    keywords: tags.join(', '),
    wordCount: readingTime * 200, // Approximate word count
    timeRequired: `PT${readingTime}M`,
    inLanguage: 'zh-CN',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
