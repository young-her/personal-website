import {
  validateSlug,
  sanitizeFileName,
  validateEmail,
  validateSecurityHeaders,
  mdxSanitizeSchema,
} from '../security'

describe('Security Utilities', () => {
  describe('validateSlug', () => {
    it('accepts valid slugs', () => {
      expect(validateSlug('valid-slug')).toBe(true)
      expect(validateSlug('valid_slug')).toBe(true)
      expect(validateSlug('valid123')).toBe(true)
      expect(validateSlug('123valid')).toBe(true)
      expect(validateSlug('a')).toBe(true)
    })

    it('rejects invalid slugs', () => {
      expect(validateSlug('invalid slug')).toBe(false) // spaces
      expect(validateSlug('invalid/slug')).toBe(false) // slash
      expect(validateSlug('invalid.slug')).toBe(false) // dot
      expect(validateSlug('invalid@slug')).toBe(false) // special chars
      expect(validateSlug('../../../etc/passwd')).toBe(false) // path traversal
      expect(validateSlug('')).toBe(false) // empty
      expect(validateSlug('a'.repeat(101))).toBe(false) // too long
    })

    it('handles edge cases', () => {
      expect(validateSlug('a-b_c123')).toBe(true)
      expect(validateSlug('123-456_789')).toBe(true)
      expect(validateSlug('a'.repeat(100))).toBe(true) // exactly 100 chars
    })
  })

  describe('sanitizeFileName', () => {
    it('removes dangerous characters', () => {
      expect(sanitizeFileName('file<>name')).toBe('file__name')
      expect(sanitizeFileName('file|name')).toBe('file_name')
      expect(sanitizeFileName('file"name')).toBe('file_name')
      expect(sanitizeFileName('file*name')).toBe('file_name')
    })

    it('preserves safe characters', () => {
      expect(sanitizeFileName('file-name.txt')).toBe('file-name.txt')
      expect(sanitizeFileName('file_name123.md')).toBe('file_name123.md')
    })

    it('handles multiple consecutive dangerous characters', () => {
      expect(sanitizeFileName('file<>|"name')).toBe('file_name')
      expect(sanitizeFileName('file***name')).toBe('file_name')
    })

    it('truncates long filenames', () => {
      const longName = 'a'.repeat(300)
      const sanitized = sanitizeFileName(longName)
      expect(sanitized.length).toBeLessThanOrEqual(255)
    })

    it('handles empty input', () => {
      expect(sanitizeFileName('')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('accepts valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
      expect(validateEmail('123@example.com')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@invalid.com')).toBe(false)
      expect(validateEmail('invalid.com')).toBe(false)
      expect(validateEmail('invalid@.com')).toBe(false)
      expect(validateEmail('invalid@com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(validateEmail('a@b.co')).toBe(true) // minimal valid email
      expect(validateEmail('a'.repeat(250) + '@example.com')).toBe(false) // too long
    })
  })

  describe('validateSecurityHeaders', () => {
    it('validates presence of required headers', () => {
      const validHeaders = {
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'content-security-policy': "default-src 'self'",
      }
      
      expect(validateSecurityHeaders(validHeaders)).toBe(true)
    })

    it('handles case-insensitive headers', () => {
      const validHeaders = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': "default-src 'self'",
      }
      
      expect(validateSecurityHeaders(validHeaders)).toBe(true)
    })

    it('rejects missing required headers', () => {
      const incompleteHeaders = {
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        // Missing x-xss-protection and content-security-policy
      }
      
      expect(validateSecurityHeaders(incompleteHeaders)).toBe(false)
    })

    it('handles empty headers object', () => {
      expect(validateSecurityHeaders({})).toBe(false)
    })
  })

  describe('mdxSanitizeSchema', () => {
    it('includes safe HTML elements', () => {
      expect(mdxSanitizeSchema.tagNames).toContain('p')
      expect(mdxSanitizeSchema.tagNames).toContain('div')
      expect(mdxSanitizeSchema.tagNames).toContain('span')
      expect(mdxSanitizeSchema.tagNames).toContain('a')
      expect(mdxSanitizeSchema.tagNames).toContain('img')
    })

    it('includes enhanced elements for rich content', () => {
      expect(mdxSanitizeSchema.tagNames).toContain('details')
      expect(mdxSanitizeSchema.tagNames).toContain('summary')
      expect(mdxSanitizeSchema.tagNames).toContain('mark')
      expect(mdxSanitizeSchema.tagNames).toContain('kbd')
      expect(mdxSanitizeSchema.tagNames).toContain('code')
      expect(mdxSanitizeSchema.tagNames).toContain('pre')
    })

    it('excludes dangerous elements', () => {
      expect(mdxSanitizeSchema.strip).toContain('script')
      expect(mdxSanitizeSchema.strip).toContain('style')
      expect(mdxSanitizeSchema.strip).toContain('iframe')
      expect(mdxSanitizeSchema.strip).toContain('object')
      expect(mdxSanitizeSchema.strip).toContain('embed')
      expect(mdxSanitizeSchema.strip).toContain('form')
    })

    it('has safe protocol whitelist', () => {
      expect(mdxSanitizeSchema.protocols?.href).toContain('http')
      expect(mdxSanitizeSchema.protocols?.href).toContain('https')
      expect(mdxSanitizeSchema.protocols?.href).toContain('mailto')
      expect(mdxSanitizeSchema.protocols?.href).toContain('tel')
      expect(mdxSanitizeSchema.protocols?.href).not.toContain('javascript')
      expect(mdxSanitizeSchema.protocols?.href).not.toContain('data')
    })

    it('allows safe attributes', () => {
      expect(mdxSanitizeSchema.attributes?.['*']).toContain('className')
      expect(mdxSanitizeSchema.attributes?.['*']).toContain('id')
      expect(mdxSanitizeSchema.attributes?.['*']).toContain('title')
      expect(mdxSanitizeSchema.attributes?.['a']).toContain('href')
      expect(mdxSanitizeSchema.attributes?.['img']).toContain('src')
      expect(mdxSanitizeSchema.attributes?.['img']).toContain('alt')
    })

    it('has clobber protection', () => {
      expect(mdxSanitizeSchema.clobberPrefix).toBe('user-content-')
      expect(mdxSanitizeSchema.clobber).toContain('name')
      expect(mdxSanitizeSchema.clobber).toContain('id')
    })
  })
})
