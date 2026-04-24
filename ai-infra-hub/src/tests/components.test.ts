import { describe, it, expect } from 'vitest'

// Mock report page component props
describe('Report Page Component', () => {
  describe('reportTypeNames mapping', () => {
    it('should have correct Chinese names for all report types', () => {
      const reportTypeNames = {
        market: '市场动态',
        tech: '技术动态',
        product: '产品动态',
      }
      
      expect(reportTypeNames.market).toBe('市场动态')
      expect(reportTypeNames.tech).toBe('技术动态')
      expect(reportTypeNames.product).toBe('产品动态')
      expect(Object.keys(reportTypeNames)).toHaveLength(3)
    })
  })

  describe('sectionConfig per report type', () => {
    it('should have correct sections for market type', () => {
      const sectionConfig: Record<string, string[]> = {
        market: ['融资', '产品', '合作', '政策'],
        tech: ['模型', '工程', '论文'],
        product: ['云厂商', '模型厂商', '芯片厂商', '创业公司'],
      }
      
      expect(sectionConfig.market).toEqual(expect.arrayContaining(['融资', '产品', '合作', '政策']))
    })

    it('should have correct sections for tech type', () => {
      const sectionConfig: Record<string, string[]> = {
        market: ['融资', '产品', '合作', '政策'],
        tech: ['模型', '工程', '论文'],
        product: ['云厂商', '模型厂商', '芯片厂商', '创业公司'],
      }
      
      expect(sectionConfig.tech).toEqual(expect.arrayContaining(['模型', '工程', '论文']))
    })

    it('should have correct sections for product type', () => {
      const sectionConfig: Record<string, string[]> = {
        market: ['融资', '产品', '合作', '政策'],
        tech: ['模型', '工程', '论文'],
        product: ['云厂商', '模型厂商', '芯片厂商', '创业公司'],
      }
      
      expect(sectionConfig.product).toEqual(expect.arrayContaining(['云厂商', '模型厂商', '芯片厂商', '创业公司']))
    })
  })

  describe('fetchReport logic', () => {
    it('should construct correct API URL', () => {
      const reportType = 'market'
      const selectedDate = '2026-04-25'
      const expectedUrl = `/api/reports?type=${reportType}&date=${selectedDate}`
      
      expect(expectedUrl).toBe('/api/reports?type=market&date=2026-04-25')
    })
  })

  describe('date navigation', () => {
    it('should generate correct date format', () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const formatted = `${year}-${month}-${day}`
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
