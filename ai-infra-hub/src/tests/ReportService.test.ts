import { describe, it, expect, vi } from 'vitest'
import { ReportService } from '../lib/services/ReportService'
import * as supabase from '../lib/db/supabase'

vi.mock('../lib/db/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  getSupabaseAdmin: vi.fn(() => supabase.supabaseAdmin),
}))

vi.mock('../lib/cache/redis', () => ({
  cacheManager: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    setex: vi.fn().mockResolvedValue(undefined),
    invalidateReport: vi.fn().mockResolvedValue(undefined),
  },
  CACHE_KEYS: {
    REPORT: () => 'test-key',
  },
  CACHE_TTL: {
    REPORT: 3600,
  },
}))

describe('ReportService', () => {
  const service = new ReportService()

  describe('generateDraft', () => {
    it('should throw error when no articles available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockedData = supabase.supabaseAdmin as any
      
      mockedData.from.mockReset()
        .mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: null, error: null }),
        })

      await expect(service.generateDraft({
        reportDate: '2026-04-25',
        reportType: 'market'
      })).rejects.toThrow('当日无可用文章')
    })
  })

  describe('getReportTitle', () => {
    it('should generate correct report titles for each type', () => {
      const service = new ReportService()
      const getReportTitle = service['getReportTitle']
      
      expect(getReportTitle('market', '2026-04-25')).toBe('市场动态日报 - 2026-04-25')
      expect(getReportTitle('tech', '2026-04-25')).toBe('技术动态日报 - 2026-04-25')
      expect(getReportTitle('product', '2026-04-25')).toBe('产品动态日报 - 2026-04-25')
    })
  })

  describe('generateSummary', () => {
    it('should generate summary with article count', () => {
      const service = new ReportService()
      const generateSummary = service['generateSummary']
      
      const articles = [{ id: '1', title: 'test' }, { id: '2', title: 'test2' }]
      const summary = generateSummary.call(service, articles)
      
      expect(summary).toContain('2 条资讯')
    })
  })
})
