import { defaultSchema } from 'rehype-sanitize'
import type { Schema } from 'hast-util-sanitize'

// Enhanced sanitization schema for MDX content
export const mdxSanitizeSchema: Schema = {
  ...defaultSchema,
  
  // Allow additional safe HTML elements for rich content
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'details',
    'summary',
    'mark',
    'kbd',
    'sub',
    'sup',
    'abbr',
    'cite',
    'dfn',
    'time',
    'var',
    'samp',
    'small',
    'ins',
    'del',
  ],
  
  // Enhanced attributes configuration
  attributes: {
    ...defaultSchema.attributes,
    
    // Allow safe attributes for all elements
    '*': [
      'className',
      'id',
      'title',
      'lang',
      'dir',
      'aria-label',
      'aria-describedby',
      'aria-hidden',
      'role',
    ],
    
    // Specific attributes for elements
    'a': ['href', 'title', 'rel', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'code': ['className'], // For syntax highlighting
    'pre': ['className'],
    'blockquote': ['cite'],
    'time': ['dateTime'],
    'abbr': ['title'],
    'details': ['open'],
    'th': ['scope', 'colspan', 'rowspan'],
    'td': ['colspan', 'rowspan'],
    'ol': ['start', 'type'],
    'li': ['value'],
  },
  
  // Protocol whitelist for links
  protocols: {
    href: ['http', 'https', 'mailto', 'tel'],
    src: ['http', 'https', 'data'],
    cite: ['http', 'https'],
  },
  
  // Remove dangerous attributes
  clobberPrefix: 'user-content-',
  clobber: ['name', 'id'],
  
  // Strip dangerous elements completely
  strip: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
}

// Input validation utilities
export function validateSlug(slug: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  const slugRegex = /^[a-zA-Z0-9_-]+$/
  return slugRegex.test(slug) && slug.length <= 100
}

export function sanitizeFileName(fileName: string): string {
  // Remove or replace dangerous characters in file names
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Rate limiting helpers (for future API routes)
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export const rateLimitConfigs = {
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  moderate: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  lenient: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 1000 requests per 15 minutes
} as const

// Security headers validation
export function validateSecurityHeaders(headers: Record<string, string>): boolean {
  const requiredHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'content-security-policy',
  ]
  
  return requiredHeaders.every(header => 
    headers[header] || headers[header.toLowerCase()]
  )
}
