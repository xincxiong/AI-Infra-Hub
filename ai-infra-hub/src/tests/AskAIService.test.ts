import { describe, it, expect } from 'vitest'
import { AskAIService } from '../lib/services/AskAIService'

describe('AskAIService', () => {
  describe('buildPrompt', () => {
    it('should build correct prompt with selected text', () => {
      const service = new AskAIService()
      const buildPrompt = (service as unknown as Record<string, (params: { selectedText: string; question?: string; reportTitle: string; reportType: string; mode: string }) => string>)['buildPrompt']
      
      const prompt = buildPrompt({
        selectedText: 'OpenAI released GPT-5',
        reportTitle: '市场动态日报 - 2026-04-25',
        reportType: 'market',
        mode: 'summary',
      })
      
      expect(prompt).toContain('OpenAI released GPT-5')
      expect(prompt).toContain('市场动态日报')
    })

    it('should include user question in prompt', () => {
      const service = new AskAIService()
      const buildPrompt = (service as unknown as Record<string, (params: { selectedText: string; question?: string; reportTitle: string; reportType: string; mode: string }) => string>)['buildPrompt']
      
      const prompt = buildPrompt({
        selectedText: 'test text',
        question: 'What does this mean?',
        reportTitle: 'Test Report',
        reportType: 'market',
        mode: 'summary',
      })
      
      expect(prompt).toContain('What does this mean?')
    })

    it('should switch prompts for different modes', () => {
      const service = new AskAIService()
      const buildPrompt = (service as unknown as Record<string, (params: { selectedText: string; question?: string; reportTitle: string; reportType: string; mode: string }) => string>)['buildPrompt']
      
      const deepPrompt = buildPrompt({
        selectedText: 'test',
        reportTitle: 'Test',
        reportType: 'market',
        mode: 'deep',
      })
      expect(deepPrompt).toContain('深度分析')

      const analyzePrompt = buildPrompt({
        selectedText: 'test',
        reportTitle: 'Test',
        reportType: 'market',
        mode: 'analyze',
      })
      expect(analyzePrompt).toContain('结构化分析')
    })
  })

  describe('extractSources', () => {
    it('should return source array from report', () => {
      const service = new AskAIService()
      
      // Access the private method
      const extractSources = (service as unknown as Record<string, (report: unknown) => Array<{ title: string; url: string; source: string; relevance: number }>>)['extractSources']
      const sources = extractSources.call(service, { highlights: [] })
      
      expect(Array.isArray(sources)).toBe(true)
      expect(sources.length).toBeGreaterThan(0)
      expect(sources[0]).toHaveProperty('title')
      expect(sources[0]).toHaveProperty('source')
    })

    it('should extract real URLs from report highlights', () => {
      const service = new AskAIService()
      const extractSources = (service as unknown as Record<string, (report: unknown) => Array<{ title: string; url: string; source: string; relevance: number }>>)['extractSources']
      
      const mockReport = {
        highlights: [
          { title: 'Test News', url: 'https://example.com/news', source: 'Official Blog', relevance: 0.95 },
          { title: 'Industry Report', url: 'https://example.com/report', source: 'Tech Media', relevance: 0.85 },
        ]
      }
      
      const sources = extractSources.call(service, mockReport)
      
      expect(sources.length).toBe(2)
      expect(sources[0].url).toBe('https://example.com/news')
      expect(sources[0].title).toBe('Test News')
      expect(sources[0].source).toBe('Official Blog')
      expect(sources[1].url).toBe('https://example.com/report')
    })

    it('should return placeholder when no highlights', () => {
      const service = new AskAIService()
      const extractSources = (service as unknown as Record<string, (report: unknown) => Array<{ title: string; url: string; source: string; relevance: number }>>)['extractSources']
      
      const sources = extractSources.call(service, { id: 'test' })
      
      expect(sources.length).toBe(1)
      expect(sources[0].title).toBe('日报数据源')
    })
  })

  describe('extractSummary', () => {
    it('should return first 200 characters with ellipsis', () => {
      const service = new AskAIService()
      const extractSummary = (service as unknown as Record<string, (answer: string) => string>)['extractSummary']
      
      const longText = 'A'.repeat(300)
      const summary = extractSummary.call(service, longText)
      
      expect(summary.length).toBe(203) // 200 chars + 3 dots
      expect(summary.endsWith('...')).toBe(true)
    })

    it('should return short text with ellipsis', () => {
      const service = new AskAIService()
      const extractSummary = (service as unknown as Record<string, (answer: string) => string>)['extractSummary']
      
      const shortText = 'Short answer'
      const summary = extractSummary.call(service, shortText)
      
      expect(summary).toBe('Short answer...')
    })
  })
})
