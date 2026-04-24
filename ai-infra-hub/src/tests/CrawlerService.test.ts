import { describe, it, expect } from 'vitest'
import { CrawlerService } from '../lib/services/CrawlerService'

describe('CrawlerService', () => {
  describe('extractTags', () => {
    it('should extract known AI company names from title and content', () => {
      const service = new CrawlerService()
      const extractTags = (service as unknown as Record<string, (title: string, content: string) => string[]>)['extractTags']
      
      const tags = extractTags('OpenAI released GPT-5', 'OpenAI and NVIDIA announced partnerships with Google')
      expect(tags).toContain('OpenAI')
      expect(tags).toContain('NVIDIA')
      expect(tags).toContain('Google')
    })

    it('should extract AI-related keywords', () => {
      const service = new CrawlerService()
      const extractTags = (service as unknown as Record<string, (title: string, content: string) => string[]>)['extractTags']
      
      const tags = extractTags('LLM inference optimization', 'Deep learning and machine learning pipeline improvements')
      expect(tags).toContain('LLM')
      expect(tags).toContain('Deep Learning')
      expect(tags).toContain('Machine Learning')
    })

    it('should limit tags to 5 items', () => {
      const service = new CrawlerService()
      const extractTags = (service as unknown as Record<string, (title: string, content: string) => string[]>)['extractTags']
      
      const tags = extractTags(
        'OpenAI GPT NVIDIA GPU Funding',
        'Google Apple Microsoft Meta AI LLM Chip Hardware'
      )
      expect(tags.length).toBeLessThanOrEqual(5)
    })
  })

  describe('detectEventType', () => {
    it('should detect funding event', () => {
      const service = new CrawlerService()
      const detectEventType = (service as unknown as Record<string, (title: string, content: string) => string>)['detectEventType']
      
      expect(detectEventType('Company raised $10M', 'Series A funding round')).toBe('funding')
    })

    it('should detect product launch event', () => {
      const service = new CrawlerService()
      const detectEventType = (service as unknown as Record<string, (title: string, content: string) => string>)['detectEventType']
      
      expect(detectEventType('New GPT model released', 'Product launch announcement')).toBe('product_launch')
    })

    it('should detect research event', () => {
      const service = new CrawlerService()
      const detectEventType = (service as unknown as Record<string, (title: string, content: string) => string>)['detectEventType']
      
      expect(detectEventType('Transformer architecture paper', 'Research study on attention')).toBe('research')
    })

    it('should detect partnership event', () => {
      const service = new CrawlerService()
      const detectEventType = (service as unknown as Record<string, (title: string, content: string) => string>)['detectEventType']
      
      expect(detectEventType('Companies work together', 'New partnership deal signed between two companies')).toBe('partnership')
    })

    it('should return general for unknown events', () => {
      const service = new CrawlerService()
      const detectEventType = (service as unknown as Record<string, (title: string, content: string) => string>)['detectEventType']
      
      expect(detectEventType('Generic news', 'Nothing specific')).toBe('general')
    })
  })

  describe('calculateQualityScore', () => {
    it('should score higher for longer titles', () => {
      const service = new CrawlerService()
      const calculateQualityScore = (service as unknown as Record<string, (result: { title: string; summary?: string; tags?: string[]; event_type?: string }) => number>)['calculateQualityScore']
      
      const shortTitle = calculateQualityScore({ title: 'Short' })
      const longTitle = calculateQualityScore({ title: 'This is a very long title that exceeds 50 characters significantly' })
      
      expect(longTitle).toBeGreaterThan(shortTitle)
    })

    it('should score higher for more tags and event type', () => {
      const service = new CrawlerService()
      const calculateQualityScore = (service as unknown as Record<string, (result: { title: string; summary?: string; tags?: string[]; event_type?: string }) => number>)['calculateQualityScore']
      
      const noTags = calculateQualityScore({ title: 'Test', tags: [] })
      const someTags = calculateQualityScore({ title: 'Test', tags: ['OpenAI', 'NVIDIA'] })
      const withEventType = calculateQualityScore({ title: 'Test', event_type: 'funding' })
      
      expect(someTags).toBeGreaterThan(noTags)
      expect(withEventType).toBeGreaterThan(noTags)
    })

    it('should cap score at 100', () => {
      const service = new CrawlerService()
      const calculateQualityScore = (service as unknown as Record<string, (result: { title: string; summary?: string; tags?: string[]; event_type?: string }) => number>)['calculateQualityScore']
      
      const maxScore = calculateQualityScore({
        title: 'Very long title for maximum score calculation that definitely exceeds 50 characters',
        summary: 'Very long summary for the test data that should also exceed one hundred characters minimum',
        tags: ['OpenAI', 'NVIDIA', 'Google', 'Apple'],
        event_type: 'funding',
      })
      
      expect(maxScore).toBeLessThanOrEqual(100)
    })
  })
})
