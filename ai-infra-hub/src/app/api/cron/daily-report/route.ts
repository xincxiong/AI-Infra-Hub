import { NextRequest, NextResponse } from 'next/server'
import { crawlerService } from '@/lib/services/CrawlerService'

// 每日定时任务：采集数据并生成日报
export async function POST(request: NextRequest) {
  try {
    // 验证授权（Vercel Cron 会携带 Authorization header）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)
    const type = searchParams.get('type') as 'market' | 'tech' | 'product' | 'all'

    console.log(`开始执行定时任务：${date}, 类型：${type || 'all'}`)

    // 1. 数据采集
    const searchQueries = [
      { query: 'AI artificial intelligence', segment: 'Technology' },
      { query: 'AI startup funding investment', segment: 'Business' },
      { query: 'AI product launch release', segment: 'Product' },
      { query: 'machine learning research paper', segment: 'Research' },
      { query: 'GPU chip hardware NVIDIA', segment: 'Hardware' },
    ]

    let totalArticles = 0

    for (const { query, segment } of searchQueries) {
      try {
        const results = await crawlerService.smartSearch({
          query,
          segment,
          date,
          maxResults: 10,
        })

        if (results.length > 0) {
          const saved = await crawlerService.saveToDatabase(results)
          totalArticles += saved
          console.log(`保存 ${saved} 篇文章：${query}`)
        }
      } catch (error) {
        console.error(`采集失败 ${query}:`, error)
      }
    }

    console.log(`共采集 ${totalArticles} 篇文章`)

    // 2. 生成日报
    const reportTypes: Array<'market' | 'tech' | 'product'> = ['market', 'tech', 'product']
    
    if (type === 'all' || !type) {
      for (const reportType of reportTypes) {
        try {
          await crawlerService.generateDailyReport(date, reportType)
        } catch (error) {
          console.error(`生成 ${reportType} 日报失败:`, error)
        }
      }
    } else {
      await crawlerService.generateDailyReport(date, type)
    }

    return NextResponse.json({
      success: true,
      message: '定时任务执行完成',
      data: {
        date,
        articlesCollected: totalArticles,
        reportsGenerated: type === 'all' || !type ? 3 : 1,
      },
    })
  } catch (error) {
    console.error('定时任务执行失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// GET 方法用于测试
export async function GET() {
  return NextResponse.json({
    message: 'Cron job endpoint is ready',
    endpoints: {
      dailyReport: '/api/cron/daily-report',
    },
  })
}
