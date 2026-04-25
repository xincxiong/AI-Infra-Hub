import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/db/supabase'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface UserResult {
  id: string
}

/**
 * GET /api/favorites - 获取用户收藏列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户 ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const userId = (user as UserResult).id

    // 获取收藏列表（包含文章详情）
    const { data: favorites, error } = await supabaseAdmin
      .from('user_favorites')
      .select(`
        id,
        created_at,
        article_id,
        raw_articles (
          id,
          title,
          summary,
          source,
          url,
          date,
          tags,
          event_type,
          quality_score
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取收藏失败:', error)
      return NextResponse.json({ error: '获取收藏失败' }, { status: 500 })
    }

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Favorites API 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * POST /api/favorites - 添加收藏
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { articleId } = body

    if (!articleId) {
      return NextResponse.json({ error: '缺少文章 ID' }, { status: 400 })
    }

    // 获取用户 ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const userId = (user as UserResult).id

    // 检查是否已收藏
    const { data: existing } = await supabaseAdmin
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single()

    if (existing) {
      return NextResponse.json({ error: '已收藏' }, { status: 400 })
    }

    // 添加收藏
    const { data: favorite, error } = await supabaseAdmin
      .from('user_favorites')
      .insert({
        user_id: userId,
        article_id: articleId
      } as never)
      .select()
      .single()

    if (error) {
      console.error('添加收藏失败:', error)
      return NextResponse.json({ error: '添加收藏失败' }, { status: 500 })
    }

    return NextResponse.json({ favorite, message: '收藏成功' })
  } catch (error) {
    console.error('Favorites API 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * DELETE /api/favorites - 删除收藏
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: '缺少文章 ID' }, { status: 400 })
    }

    // 获取用户 ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const userId = (user as UserResult).id

    // 删除收藏
    const { error } = await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId)

    if (error) {
      console.error('删除收藏失败:', error)
      return NextResponse.json({ error: '删除收藏失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '取消收藏成功' })
  } catch (error) {
    console.error('Favorites API 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}