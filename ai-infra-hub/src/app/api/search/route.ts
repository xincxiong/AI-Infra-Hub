import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'

export const dynamic = 'force-dynamic'

interface ArticleResult {
  id: string
  title: string
  summary: string | null
  source: string
  url: string
  date: string
  tags: string[] | null
  event_type: string | null
  quality_score: number | null
  region: string | null
  segment: string | null
  verified: boolean
}

/**
 * GET /api/search - 搜索文章
 * 
 * Query params:
 * - q: 搜索关键词
 * - type: 日报类型 (market/tech/product)
 * - startDate: 开始日期
 * - endDate: 结束日期
 * - tags: 标签筛选
 * - limit: 返回数量限制
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') // market, tech, product
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tags = searchParams.get('tags')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query) {
      return NextResponse.json({ error: '请提供搜索关键词' }, { status: 400 })
    }

    // 构建 Supabase 查询
    let supabaseQuery = supabaseAdmin
      .from('raw_articles')
      .select(`
        id,
        title,
        summary,
        source,
        url,
        date,
        tags,
        event_type,
        quality_score,
        region,
        segment,
        verified
      `)
      .eq('verified', true)
      .limit(limit)

    // 搜索关键词（标题或摘要）
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%`)

    // 日期范围筛选
    if (startDate) {
      supabaseQuery = supabaseQuery.gte('date', startDate)
    }
    if (endDate) {
      supabaseQuery = supabaseQuery.lte('date', endDate)
    }

    // 标签筛选
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim())
      supabaseQuery = supabaseQuery.contains('tags', tagArray)
    }

    // 按质量评分排序
    supabaseQuery = supabaseQuery.order('quality_score', { ascending: false })
    supabaseQuery = supabaseQuery.order('date', { ascending: false })

    const { data: articles, error, count } = await supabaseQuery

    if (error) {
      console.error('搜索失败:', error)
      return NextResponse.json({ error: '搜索失败' }, { status: 500 })
    }

    // 如果指定了日报类型，需要根据 segment/event_type 进行筛选
    let filteredArticles = (articles || []) as ArticleResult[]
    
    if (type) {
      const typeFilters: Record<string, { segments?: string[], eventTypes?: string[] }> = {
        market: {
          segments: ['融资', '产品', '合作', '政策'],
          eventTypes: ['funding', 'product_launch', 'partnership', 'policy']
        },
        tech: {
          segments: ['模型', '工程', '论文'],
          eventTypes: ['model_release', 'engineering', 'paper']
        },
        product: {
          segments: ['云厂商', '模型厂商', '芯片厂商', '创业公司'],
          eventTypes: ['cloud_vendor', 'model_vendor', 'chip_vendor', 'startup']
        }
      }

      const filter = typeFilters[type]
      if (filter) {
        filteredArticles = filteredArticles.filter(article => {
          if (filter.segments && article.segment) {
            return filter.segments.some(s => article.segment?.includes(s))
          }
          if (filter.eventTypes && article.event_type) {
            return filter.eventTypes.some(e => article.event_type?.includes(e))
          }
          return true
        })
      }
    }

    return NextResponse.json({
      query,
      total: count || filteredArticles.length,
      articles: filteredArticles
    })
  } catch (error) {
    console.error('Search API 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}