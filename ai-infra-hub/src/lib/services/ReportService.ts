import { supabaseAdmin } from '../db/supabase'
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '../cache/redis'

export interface GenerateReportRequest {
  reportDate: string
  reportType: 'market' | 'tech' | 'product'
}

export class ReportService {
  async generateDraft(request: GenerateReportRequest) {
    const { reportDate, reportType } = request

    // 1. 获取原始文章
    const articles = await this.getRawArticles(reportDate)
    if (articles.length === 0) {
      throw new Error('当日无可用文章')
    }

    // 2. 生成重点关注
    const highlights = await this.generateHighlights(articles)

    // 3. 生成洞察
    const insights = await this.generateInsights(articles)

    // 4. 按模块分组
    const sections = this.groupByModules(articles)

    // 5. 保存日报
    const report = await this.saveReport({
      type: reportType,
      report_date: reportDate,
      title: this.getReportTitle(reportType, reportDate),
      summary: this.generateSummary(articles),
      highlights,
      insights,
      sections,
      status: 'draft',
      quality_score: this.calculateQualityScore(articles),
    })

    return report
  }

  async getReport(type: string, date: string) {
    // 先查缓存
    const cacheKey = CACHE_KEYS.REPORT(date, type)
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      return cached
    }

    // 查数据库
    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .select('*')
      .eq('type', type)
      .eq('report_date', date)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return null
    }

    // 写入缓存
    await cacheManager.set(cacheKey, data, CACHE_TTL.REPORT)
    return data
  }

  async publishReport(reportId: string) {
    const { data: report, error } = await supabaseAdmin
      .from('daily_reports')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      throw new Error('发布失败: ' + error.message)
    }

    // 清除缓存
    await cacheManager.invalidateReport(report.report_date, report.type)

    return report
  }

  private async getRawArticles(reportDate: string) {
    const { data, error } = await supabaseAdmin
      .from('raw_articles')
      .select('*')
      .eq('date', reportDate)
      .eq('verified', true)
      .order('quality_score', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error('获取文章失败: ' + error.message)
    }

    return data || []
  }

  private async generateHighlights(articles: unknown[]) {
    // 简化版本：取质量分最高的4条
    return (articles as Array<{ id: string; title: string; summary?: string; source: string; url: string; segment?: string; event_type?: string }>)
      .slice(0, 4)
      .map((article, index) => ({
        id: `highlight-${index}`,
        title: article.title,
        summary: article.summary || article.title,
        source: article.source,
        url: article.url,
        tag: article.segment || article.event_type,
      }))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async generateInsights(articles: unknown[]) {

    // 简化版本：生成3条通用洞察
    return [
      {
        id: 'insight-1',
        title: '行业趋势加速',
        description: '今日动态显示行业正在快速发展，建议密切关注后续进展。',
        impact: '对行业决策者具有重要参考价值。',
      },
      {
        id: 'insight-2',
        title: '技术竞争加剧',
        description: '主要厂商持续推出新产品，市场竞争日趋激烈。',
        impact: '建议评估自身产品的差异化优势。',
      },
      {
        id: 'insight-3',
        title: '投资机会显现',
        description: '新兴技术和产品方向值得关注，可能存在投资机会。',
        impact: '建议深入研究相关领域。',
      },
    ]
  }

  private groupByModules(articles: Array<{ id: string; title: string; summary?: string; source: string; url: string; date: string; segment?: string }>) {
    const modules: Record<string, Array<{ id: string; title: string; summary: string; source: string; url: string; date: string }>> = {}

    articles.forEach((article) => {
      const moduleName = article.segment || '其他'
      if (!modules[moduleName]) {
        modules[moduleName] = []
      }
      modules[moduleName].push({
        id: article.id,
        title: article.title,
        summary: article.summary || '',
        source: article.source,
        url: article.url,
        date: article.date,
      })
    })

    return Object.entries(modules).map(([name, items]) => ({
      id: `section-${name}`,
      name,
      items,
    }))
  }

  private async saveReport(data: {
    type: string
    report_date: string
    title: string
    summary: string
    highlights: Array<{ id: string; title: string; summary: string; source: string; url: string; tag?: string }>
    insights: Array<{ id: string; title: string; description: string; impact: string }>
    sections: Array<{ id: string; name: string; items: Array<{ id: string; title: string; summary: string; source: string; url: string; date: string }> }>
    status: string
    quality_score: number
  }) {
    const { data: report, error } = await supabaseAdmin
      .from('daily_reports')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new Error('保存日报失败: ' + error.message)
    }

    return report
  }

  private getReportTitle(type: string, date: string) {
    const titles: Record<string, string> = {
      market: '市场动态日报',
      tech: '技术动态日报',
      product: '产品动态日报',
    }
    return `${titles[type]} - ${date}`
  }

  private generateSummary(articles: unknown[]) {
    return `今日共收录 ${articles.length} 条资讯，涵盖产品发布、技术进展、市场动态等多个维度。`
  }

  private calculateQualityScore(articles: unknown[]) {
    const baseScore = 80
    const articleScore = Math.min(articles.length * 2, 20)
    return baseScore + articleScore
  }
}

export const reportService = new ReportService()