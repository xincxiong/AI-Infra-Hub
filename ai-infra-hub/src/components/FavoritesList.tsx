'use client'

import { useState, useEffect } from 'react'
import { Heart, ExternalLink, Trash2, Calendar } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Favorite {
  id: string
  created_at: string
  article_id: string
  raw_articles: {
    id: string
    title: string
    summary: string | null
    source: string
    url: string
    date: string
    tags: string[] | null
    event_type: string | null
    quality_score: number | null
  }
}

export default function FavoritesList() {
  const { data: session, status } = useSession()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchFavorites()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('获取收藏失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (articleId: string) => {
    try {
      const response = await fetch(`/api/favorites?articleId=${articleId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.article_id !== articleId))
      }
    } catch (error) {
      console.error('删除收藏失败:', error)
    }
  }

  if (!session?.user) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>请先登录查看收藏</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>加载中...</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>暂无收藏</p>
        <p className="text-sm mt-2">在日报中点击收藏按钮添加</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-current" />
        我的收藏 ({favorites.length})
      </h2>
      
      {favorites.map((favorite) => (
        <div
          key={favorite.id}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {favorite.raw_articles.title}
              </h3>
              
              {favorite.raw_articles.summary && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {favorite.raw_articles.summary}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{favorite.raw_articles.date}</span>
                </div>
                
                <span className="px-2 py-1 bg-gray-100 rounded-lg font-medium">
                  {favorite.raw_articles.source}
                </span>
                
                {favorite.raw_articles.tags && favorite.raw_articles.tags.length > 0 && (
                  <div className="flex gap-1">
                    {favorite.raw_articles.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href={favorite.raw_articles.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="查看原文"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              
              <button
                onClick={() => handleRemoveFavorite(favorite.article_id)}
                className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="取消收藏"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}