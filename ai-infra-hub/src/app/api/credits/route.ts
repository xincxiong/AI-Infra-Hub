import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cacheManager } from '@/lib/cache/redis'

// 强制使用动态渲染
export const dynamic = 'force-dynamic'

// GET /api/credits - 获取用户剩余额度
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      // 游客模式
      return NextResponse.json({
        userId: 'guest',
        remaining: 5,
        total: 5,
        used: 0,
        isGuest: true,
      })
    }

    const userId = (session.user as { id: string }).id
    const credits = await cacheManager.getAskAICredits(userId)

    return NextResponse.json({
      userId,
      remaining: credits.remaining,
      total: 100,
      used: credits.used,
      isGuest: false,
    })
  } catch (error) {
    console.error('获取额度失败:', error)
    return NextResponse.json(
      { error: '获取额度失败' },
      { status: 500 }
    )
  }
}

// POST /api/credits/reset - 重置用户额度（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    // 检查管理员权限：必须是 admin 角色
    const { supabaseAdmin } = await import('@/lib/db/supabase')
    const currentUserEmail = (session.user as { email?: string }).email
    if (!currentUserEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentUser } = await (supabaseAdmin as any)
      .from('users')
      .select('role')
      .eq('email', currentUserEmail)
      .single()

    if (!currentUser || (currentUser as { role: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date().toISOString().slice(0, 10)
    const key = `credits:${userId}:${today}`
    
    await cacheManager.del(key)

    return NextResponse.json({
      success: true,
      message: '额度已重置',
    })
  } catch (error) {
    console.error('重置额度失败:', error)
    return NextResponse.json(
      { error: '重置额度失败' },
      { status: 500 }
    )
  }
}
