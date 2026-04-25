'use client'

import FavoritesList from '@/components/FavoritesList'
import { Heart } from 'lucide-react'

// 禁用预渲染，因为页面依赖用户登录状态
export const dynamic = 'force-dynamic'

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">我的收藏</h1>
              <p className="text-sm text-gray-500">收藏的 AI 行业资讯</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FavoritesList />
      </main>
    </div>
  )
}