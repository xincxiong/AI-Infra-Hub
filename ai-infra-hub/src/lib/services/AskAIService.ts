import { llmRouter } from '../llm/router/LLMRouter'
import { supabaseAdmin } from '../db/supabase'
import { cacheManager } from '../cache/redis'

export interface AskRequest {
  userId?: string
  reportId: string
  selectedText: string
  question?: string
  sessionId?: string
  mode?: 'summary' | 'deep' | 'search' | 'analyze'
}

export interface AskResponse {
  sessionId: string
  answer: string
  summary?: string
  sources: Array<{
    title: string
    url: string
    source: string
    relevance: number
  }>
  relatedItems: Array<{
    id: string
    title: string
    summary: string
    relevance: number
  }>
  creditsUsed: number
  creditsRemaining: number
}

export class AskAIService {
  private readonly CREDITS_PER_REQUEST = 1
  private readonly MAX_CREDITS_PER_DAY = 100

  async ask(request: AskRequest): Promise<AskResponse> {
    // 1. 检查额度
    const credits = await this.checkCredits(request.userId)
    if (credits.remaining < this.CREDITS_PER_REQUEST) {
      throw new Error('AI 额度不足，请明天再试')
    }

    // 2. 获取日报上下文
    const report = await this.getReportContext(request.reportId)
    if (!report) {
      throw new Error('日报不存在')
    }

    // 3. 构建 Prompt
    const prompt = this.buildPrompt({
      selectedText: request.selectedText,
      question: request.question,
      reportTitle: report.title,
      reportType: report.type,
      mode: request.mode || 'summary',
    })

    // 4. 调用 AI
    const client = await llmRouter.getClient('ask-ai')
    const answer = await client.generate({
      prompt,
      systemPrompt: this.getSystemPrompt(),
      temperature: 0.7,
      maxTokens: 2000,
    })

    // 5. 解析来源
    const sources = this.extractSources(answer, report)
    const relatedItems = await this.findRelatedItems(request.selectedText, report)

    // 6. 保存会话
    const sessionId = await this.saveSession({
      userId: request.userId,
      reportId: request.reportId,
      selectedText: request.selectedText,
      question: request.question,
      answer,
      sources,
      relatedItems,
    })

    // 7. 扣除额度
    const remainingCredits = await this.deductCredits(request.userId)

    return {
      sessionId,
      answer,
      summary: request.question ? undefined : this.extractSummary(answer),
      sources,
      relatedItems,
      creditsUsed: this.CREDITS_PER_REQUEST,
      creditsRemaining: remainingCredits,
    }
  }

  async *askStream(request: AskRequest): AsyncGenerator<string> {
    // 检查额度
    const credits = await this.checkCredits(request.userId)
    if (credits.remaining < this.CREDITS_PER_REQUEST) {
      yield JSON.stringify({ error: 'AI 额度不足' })
      return
    }

    // 获取上下文
    const report = await this.getReportContext(request.reportId)
    if (!report) {
      yield JSON.stringify({ error: '日报不存在' })
      return
    }

    // 构建 Prompt
    const prompt = this.buildPrompt({
      selectedText: request.selectedText,
      question: request.question,
      reportTitle: report.title,
      reportType: report.type,
      mode: request.mode || 'summary',
    })

    // 流式生成
    const client = await llmRouter.getClient('ask-ai')
    let fullAnswer = ''

    for await (const chunk of client.generateStream({
      prompt,
      systemPrompt: this.getSystemPrompt(),
      temperature: 0.7,
    })) {
      fullAnswer += chunk
      yield JSON.stringify({ chunk, type: 'content' })
    }

    // 保存会话
    await this.saveSession({
      userId: request.userId,
      reportId: request.reportId,
      selectedText: request.selectedText,
      question: request.question,
      answer: fullAnswer,
      sources: [],
      relatedItems: [],
    })

    // 扣除额度
    await this.deductCredits(request.userId)

    yield JSON.stringify({ type: 'complete' })
  }

  private async checkCredits(userId?: string): Promise<{ remaining: number; total: number }> {
    if (!userId) {
      return { remaining: 5, total: 5 } // 游客 5 次
    }

    return await cacheManager.getAskAICredits(userId)
  }

  private async deductCredits(userId?: string): Promise<number> {
    if (!userId) return 0
    return await cacheManager.deductAskAICredit(userId)
  }

  private async getReportContext(reportId: string) {
    const { data, error } = await supabaseAdmin
      .from('daily_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) return null
    return data
  }

  private buildPrompt(params: {
    selectedText: string
    question?: string
    reportTitle: string
    reportType: string
    mode: string
  }): string {
    const { selectedText, question, reportTitle, reportType, mode } = params

    let prompt = `## 日报上下文
日报类型: ${reportType === 'market' ? '市场动态' : reportType === 'tech' ? '技术动态' : '产品动态'}
日报标题: ${reportTitle}

## 用户选中的内容
"""${selectedText}"""
`

    if (question) {
      prompt += `\n## 用户问题\n${question}\n`
    } else {
      prompt += `\n## 任务\n请基于选中的内容，生成一段 2-3 句话的核心摘要。\n`
    }

    switch (mode) {
      case 'deep':
        prompt += `\n## 回答要求\n请提供深度分析，包括：背景、影响、趋势、建议。\n`
        break
      case 'analyze':
        prompt += `\n## 回答要求\n请进行结构化分析，输出核心要点、利弊分析、关键数据。\n`
        break
    }

    return prompt
  }

  private getSystemPrompt(): string {
    return `你是 AI Infra Hub 的智能问答助手，专门帮助用户深入理解 AI 行业日报内容。

## 职责
1. 基于用户选中的日报内容，提供专业、准确的解读
2. 回答用户关于 AI 行业技术、市场、产品的问题
3. 提供背景信息、影响分析和行动建议

## 回答风格
- 专业但易懂，避免过度技术化
- 结构清晰，使用 Markdown 格式
- 中文回答
- 客观中立`
  }

  private extractSummary(answer: string): string {
    // 提取前 200 字符作为摘要
    return answer.slice(0, 200).trim() + '...'
  }

  private extractSources(answer: string, report: any): Array<any> {
    // 简化版本：返回模拟来源
    return [
      { title: '官方公告', url: '#', source: '官方', relevance: 0.95 },
      { title: '行业分析', url: '#', source: '媒体', relevance: 0.85 },
    ]
  }

  private async findRelatedItems(selectedText: string, report: any): Promise<Array<any>> {
    // 简化版本：从日报 sections 中找相关条目
    const allItems = report.sections?.flatMap((s: any) => s.items || []) || []
    return allItems.slice(0, 2).map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary?.slice(0, 100) || '',
      relevance: 0.8,
    }))
  }

  private async saveSession(data: {
    userId?: string
    reportId: string
    selectedText: string
    question?: string
    answer: string
    sources: any[]
    relatedItems: any[]
  }): Promise<string> {
    const { data: session, error } = await supabaseAdmin
      .from('ask_ai_sessions')
      .insert({
        user_id: data.userId,
        report_id: data.reportId,
        selected_text: data.selectedText,
        user_question: data.question,
        ai_response: data.answer,
        sources: data.sources,
        related_items: data.relatedItems.map((i) => i.id),
      })
      .select('id')
      .single()

    if (error) {
      throw new Error('保存会话失败: ' + error.message)
    }

    return session.id
  }
}

export const askAIService = new AskAIService()
