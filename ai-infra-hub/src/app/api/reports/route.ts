import { NextRequest, NextResponse } from 'next/server'
import { reportService } from '@/lib/services/ReportService'

// GET /api/reports - 获取日报列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'market'
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: '缺少 date 参数' },
        { status: 400 }
      )
    }

    const report = await reportService.getReport(type, date)

    if (!report) {
      return NextResponse.json(
        { error: '日报不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('获取日报失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// POST /api/reports - 生成日报草稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportDate, reportType } = body

    if (!reportDate || !reportType) {
      return NextResponse.json(
        { error: '缺少必要参数: reportDate, reportType' },
        { status: 400 }
      )
    }

    const report = await reportService.generateDraft({
      reportDate,
      reportType,
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('生成日报失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}