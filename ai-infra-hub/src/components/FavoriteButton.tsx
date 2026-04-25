'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface FavoriteButtonProps {
  articleId: string
  onFavoriteChange?: (isFavorite: boolean) => void
}

export default function FavoriteButton({ articleId, onFavoriteChange }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  // 检查是否已收藏
  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus()
    }
  }, [session, articleId])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        const isFav = data.favorites?.some((fav: { article_id: string }) => fav.article_id === articleId)
        setIsFavorite(isFav)
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!session?.user) {
      alert('请先登录')
      return
    }

    setLoading(true)
    try {
      if (isFavorite) {
        // 取消收藏
        const response = await fetch(`/api/favorites?articleId=${articleId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setIsFavorite(false)
          onFavoriteChange?.(false)
        }
      } else {
        // 添加收藏
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId })
        })
        if (response.ok) {
          setIsFavorite(true)
          onFavoriteChange?.(true)
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-2 rounded-lg transition-all ${
        isFavorite 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? '取消收藏' : '添加收藏'}
    >
      <Heart 
        className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} 
      />
    </button>
  )
}