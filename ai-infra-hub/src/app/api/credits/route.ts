import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cacheManager } from '@/lib/cache/redis'

// GET /api/credits - 获取用户剩余额度
export async function GET(request: NextRequest) {
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

    const userId = session.user.id
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

    // TODO: 检查管理员权限
    // if (!isAdmin(session.user)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

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
