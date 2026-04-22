import { llmRouter } from '../llm/router/LLMRouter'
import { supabaseAdmin } from '../db/supabase'

export interface CrawlResult {
  url: string
  source: string
  date: string
  title: string
  summary: string
  region?: string
  segment?: string
  tags?: string[]
  event_type?: string
}

export interface SearchOptions {
  query: string
  maxResults?: number
  date?: string
  segment?: string
  region?: string
}

export class CrawlerService {
  private readonly TAVILY_API_KEY = process.env.TAVILY_API_KEY
  private readonly ALIYUN_BAILIAN_API_KEY = process.env.ALIYUN_BAILIAN_API_KEY

  /**
   * 使用 Tavily API 搜索 AI 相关资讯
   */
  async searchWithTavily(options: SearchOptions): Promise<CrawlResult[]> {
    if (!this.TAVILY_API_KEY) {
      throw new Error('Tavily API Key 未配置')
    }

    const { query, maxResults = 10, date, segment, region } = options

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.TAVILY_API_KEY,
          query: `${query} ${segment || ''} ${region || ''}`.trim(),
          search_depth: 'advanced',
          include_answer: false,
          max_results: maxResults,
          include_domains: [
            'techcrunch.com',
            'theverge.com',
            'wired.com',
            'arstechnica.com',
            'venturebeat.com',
            'reuters.com',
            'bloomberg.com',
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Tavily API 错误：${response.statusText}`)
      }

      const data = await response.json()

      return data.results.map((result: { url: string; title: string; content: string }) => ({
        url: result.url,
        source: new URL(result.url).hostname,
        date: date || new Date().toISOString().slice(0, 10),
        title: result.title,
        summary: result.content,
        region: region || 'Global',
        segment: segment || 'General',
        tags: this.extractTags(result.title, result.content),
        event_type: this.detectEventType(result.title, result.content),
      }))
    } catch (error) {
      console.error('Tavily 搜索失败:', error)
      return []
    }
  }

  /**
   * 使用阿里云百炼搜索 AI 相关资讯
   */
  async searchWithAliyun(options: SearchOptions): Promise<CrawlResult[]> {
    if (!this.ALIYUN_BAILIAN_API_KEY) {
      throw new Error('阿里云百炼 API Key 未配置')
    }

    const { query, date, segment, region } = options

    try {
      const client = await llmRouter.getClient('summary')
      
      // 使用 LLM 生成搜索关键词和摘要
      const searchPrompt = `请基于以下主题搜索 AI 行业相关资讯：
主题：${query}
领域：${segment || 'AI 基础设施'}
地区：${region || '全球'}

请生成 5-10 个相关的新闻标题和摘要。`

      const response = await client.generate({
        prompt: searchPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      })

      // 解析 LLM 返回的结果（简化处理）
      return this.parseLLMResults(response, date || new Date().toISOString().slice(0, 10), segment, region)
    } catch (error) {
      console.error('阿里云百炼搜索失败:', error)
      return []
    }
  }

  /**
   * 智能路由：自动选择最佳搜索源
   */
  async smartSearch(options: SearchOptions): Promise<CrawlResult[]> {
    // 优先使用 Tavily（更准确）
    if (this.TAVILY_API_KEY) {
      const tavilyResults = await this.searchWithTavily(options)
      if (tavilyResults.length > 0) {
        return tavilyResults
      }
    }

    // 降级到阿里云百炼
    if (this.ALIYUN_BAILIAN_API_KEY) {
      return await this.searchWithAliyun(options)
    }

    throw new Error('没有可用的搜索服务，请配置 Tavily 或阿里云百炼 API Key')
  }

  /**
   * 保存采集结果到数据库
   */
  async saveToDatabase(results: CrawlResult[]): Promise<number> {
    let savedCount = 0

    for (const result of results) {
      try {
        // 检查是否已存在（URL 去重）
        const { data: existing } = await supabaseAdmin
          .from('raw_articles')
          .select('id')
          .eq('url', result.url)
          .single()

        if (existing) {
          console.log(`跳过已存在文章：${result.url}`)
          continue
        }

        // 插入新文章
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabaseAdmin as any)
          .from('raw_articles')
          .insert({
            url: result.url,
            source: result.source,
            date: result.date,
            title: result.title,
            summary: result.summary,
            region: result.region,
            segment: result.segment,
            tags: result.tags,
            event_type: result.event_type,
            verified: false,
            quality_score: this.calculateQualityScore(result),
          })

        if (!error) {
          savedCount++
        }
      } catch (error) {
        console.error(`保存文章失败：${result.url}`, error)
      }
    }

    return savedCount
  }

  /**
   * 生成日报
   */
  async generateDailyReport(date: string, type: 'market' | 'tech' | 'product'): Promise<void> {
    // 获取当天的文章
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: articles } = await (supabaseAdmin as any)
      .from('raw_articles')
      .select('*')
      .eq('date', date)
      .eq('verified', true)

    if (!articles || articles.length === 0) {
      console.log(`未找到 ${date} 的文章`)
      return
    }

    // 按类型筛选
    const articlesTyped = articles as Array<{ id: string; title: string; summary?: string; source: string; url: string; segment?: string; tags?: string[] }>
    const filteredArticles = articlesTyped.filter(article => {
      if (type === 'market') return article.segment === 'Market' || article.segment === 'Business'
      if (type === 'tech') return article.segment === 'Technology' || article.segment === 'Research'
      if (type === 'product') return article.segment === 'Product' || article.segment === 'Release'
      return true
    })

    if (filteredArticles.length === 0) {
      console.log(`未找到 ${type} 类型的文章`)
      return
    }

    // 使用 LLM 生成日报内容
    const client = await llmRouter.getClient('summary')
    const reportPrompt = this.buildReportPrompt(filteredArticles, type)
    
    const reportContent = await client.generate({
      prompt: reportPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    })

    // 解析并保存日报
    await this.saveDailyReport(type, date, reportContent, filteredArticles)
  }

  /**
   * 提取标签
   */
  private extractTags(title: string, content: string): string[] {
    const keywords = [
      'OpenAI', 'Google', 'Microsoft', 'Meta', 'Amazon', 'Apple',
      'LLM', 'GPT', 'AI', 'Machine Learning', 'Deep Learning',
      'GPU', 'NVIDIA', 'Chip', 'Hardware',
      'Funding', 'Investment', 'Acquisition', 'Startup',
      'Release', 'Launch', 'Update', 'Beta',
    ]

    const text = `${title} ${content}`.toLowerCase()
    return keywords
      .filter(kw => text.includes(kw.toLowerCase()))
      .slice(0, 5)
  }

  /**
   * 检测事件类型
   */
  private detectEventType(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    if (text.includes('funding') || text.includes('investment') || text.includes('raised')) {
      return 'funding'
    }
    if (text.includes('release') || text.includes('launch') || text.includes('announce')) {
      return 'product_launch'
    }
    if (text.includes('acquisition') || text.includes('acquire') || text.includes('merge')) {
      return 'acquisition'
    }
    if (text.includes('research') || text.includes('paper') || text.includes('study')) {
      return 'research'
    }
    if (text.includes('partnership') || text.includes('collaborate')) {
      return 'partnership'
    }

    return 'general'
  }

  /**
   * 计算质量分数
   */
  private calculateQualityScore(result: CrawlResult): number {
    let score = 50

    // 标题长度
    if (result.title.length > 30) score += 10
    if (result.title.length > 50) score += 10

    // 摘要长度
    if (result.summary && result.summary.length > 100) score += 10
    if (result.summary && result.summary.length > 200) score += 10

    // 标签数量
    if (result.tags && result.tags.length > 0) score += 5
    if (result.tags && result.tags.length > 3) score += 5

    // 事件类型
    if (result.event_type) score += 5

    return Math.min(score, 100)
  }

  /**
   * 解析 LLM 结果
   */
  private parseLLMResults(content: string, date: string, segment?: string, region?: string): CrawlResult[] {
    // 简化解析：按行分割
    const lines = content.split('\n').filter(line => line.trim().length > 0)
    const results: CrawlResult[] = []

    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        results.push({
          url: `#generated-${i}`,
          source: 'aliyun-llm',
          date,
          title: lines[i].replace(/^[#*\-]\s*/, '').trim(),
          summary: lines[i + 1].trim(),
          region: region || 'Global',
          segment: segment || 'General',
          tags: [],
          event_type: 'general',
        })
      }
    }

    return results.slice(0, 10)
  }

  /**
   * 构建日报生成 Prompt
   */
  private buildReportPrompt(articles: Array<{ id: string; title: string; summary?: string; source: string }>, type: 'market' | 'tech' | 'product'): string {
    const typeNames = {
      market: '市场动态',
      tech: '技术动态',
      product: '产品动态',
    }

    let prompt = `请基于以下文章生成一篇 AI 行业${typeNames[type]}日报：

`

    articles.forEach((article, i) => {
      prompt += `${i + 1}. ${article.title}\n   ${article.summary}\n   来源：${article.source}\n\n`
    })

    prompt += `
请按照以下格式生成日报：
1. 日报标题（简洁有力）
2. 核心摘要（200 字以内）
3. 重点关注（3-5 个亮点）
4. 详细报道（按重要性排序）
5. 业务洞察（对行业的影响和建议）
`

    return prompt
  }

  /**
   * 保存日报
   */
  private async saveDailyReport(
    type: string,
    date: string,
    content: string,
    articles: Array<{ id: string; title: string; summary?: string; source: string; url: string; tags?: string[] }>
  ): Promise<void> {
    const lines = content.split('\n')
    const title = lines[0]?.replace(/^[#*\-]\s*/, '').trim() || `${type}日报 - ${date}`
    const summary = lines.slice(1, 3).join('\n').trim()

    const highlights = articles.slice(0, 5).map(article => ({
      id: `highlight-${article.id}`,
      title: article.title,
      summary: article.summary?.slice(0, 100) || '',
      source: article.source,
      url: article.url,
      tag: article.tags?.[0] || '',
    }))

    const sections = [
      {
        id: 'main',
        name: '主要内容',
        items: articles.map(article => ({
          id: article.id,
          title: article.title,
          summary: article.summary,
          source: article.source,
          url: article.url,
        })),
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('daily_reports')
      .insert({
        type,
        report_date: date,
        title,
        summary,
        highlights,
        insights: [],
        sections,
        status: 'published',
        quality_score: 85,
        published_at: new Date().toISOString(),
      })

    if (error) {
      console.error('保存日报失败:', error)
    } else {
      console.log(`成功保存 ${type} 日报：${title}`)
    }
  }
}

export const crawlerService = new CrawlerService()
