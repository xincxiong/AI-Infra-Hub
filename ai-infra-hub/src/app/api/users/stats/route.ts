import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db/supabase'

// 强制使用动态渲染
export const dynamic = 'force-dynamic'

// GET /api/users/stats - 获取用户统计信息
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id

    // 获取用户会话统计
    const { count: sessionCount } = await supabaseAdmin
      .from('ask_ai_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 获取今日使用量
    const today = new Date().toISOString().slice(0, 10)
    const { count: todayCount } = await supabaseAdmin
      .from('ask_ai_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today)

    return NextResponse.json({
      userId,
      totalSessions: sessionCount || 0,
      todaySessions: todayCount || 0,
      creditsUsed: todayCount || 0,
    })
  } catch (error) {
    console.error('获取统计失败:', error)
    return NextResponse.json(
      { error: '获取统计失败' },
      { status: 500 }
    )
  }
}
