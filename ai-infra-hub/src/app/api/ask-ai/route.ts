import { NextRequest, NextResponse } from 'next/server'
import { askAIService } from '@/lib/services/AskAIService'

// POST /api/ask-ai - 标准问答
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, selectedText, question, userId, mode } = body

    if (!reportId || !selectedText) {
      return NextResponse.json(
        { error: '缺少必要参数: reportId, selectedText' },
        { status: 400 }
      )
    }

    const response = await askAIService.ask({
      userId,
      reportId,
      selectedText,
      question,
      mode,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('ASK AI 错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}

// GET /api/ask-ai?stream=1 - 流式问答
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reportId = searchParams.get('reportId')
  const selectedText = searchParams.get('selectedText')
  const question = searchParams.get('question') || undefined
  const userId = searchParams.get('userId') || undefined

  if (!reportId || !selectedText) {
    return NextResponse.json(
      { error: '缺少必要参数' },
      { status: 400 }
    )
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of askAIService.askStream({
          userId,
          reportId,
          selectedText,
          question,
        })) {
          controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
