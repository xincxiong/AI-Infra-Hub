'use client'

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import SearchResults from '@/components/SearchResults'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useState<{
    query: string
    type?: string
    startDate?: string
    endDate?: string
    tags?: string
  } | null>(null)
  const [results, setResults] = useState<{
    query: string
    total: number
    articles: Array<{
      id: string
      title: string
      summary: string | null
      source: string
      url: string
      date: string
      tags: string[] | null
      event_type: string | null
      quality_score: number | null
      region: string | null
      segment: string | null
      verified: boolean
    }>
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (params: {
    query: string
    type?: string
    startDate?: string
    endDate?: string
    tags?: string
  }) => {
    setSearchParams(params)
    setLoading(true)

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('q', params.query)
      if (params.type) queryParams.append('type', params.type)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.tags) queryParams.append('tags', params.tags)

      const response = await fetch(`/api/search?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">搜索</h1>
              <p className="text-sm text-gray-500">搜索 AI 行业资讯</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 搜索栏 */}
        <SearchBar onSearch={handleSearch} />

        {/* 搜索结果 */}
        {searchParams && (
          <div className="mt-8">
            <SearchResults
              query={searchParams.query}
              total={results?.total || 0}
              articles={results?.articles || []}
              loading={loading}
            />
          </div>
        )}

        {/* 未搜索时的提示 */}
        {!searchParams && (
          <div className="mt-12 text-center text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">输入关键词开始搜索</p>
            <p className="text-sm">支持按日期、类型、标签筛选</p>
          </div>
        )}
      </main>
    </div>
  )
}