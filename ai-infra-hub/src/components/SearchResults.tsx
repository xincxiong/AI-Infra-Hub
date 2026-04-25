'use client'

import { useState } from 'react'
import { ExternalLink, Calendar, Tag, Heart } from 'lucide-react'
import FavoriteButton from './FavoriteButton'

interface Article {
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
}

interface SearchResultsProps {
  query: string
  total: number
  articles: Article[]
  loading?: boolean
}

export default function SearchResults({ query, total, articles, loading }: SearchResultsProps) {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedArticles)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedArticles(newExpanded)
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>搜索中...</p>
      </div>
    )
  }

  if (!query) {
    return null
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">未找到相关结果</p>
        <p className="text-sm">尝试使用不同的关键词或筛选条件</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          搜索结果 ({total})
        </h2>
        <p className="text-sm text-gray-500">
          关键词: "{query}"
        </p>
      </div>

      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => toggleExpand(article.id)}
              >
                {article.title}
              </h3>
              
              {article.summary && (
                <p className={`text-gray-600 text-sm mb-3 ${
                  expandedArticles.has(article.id) ? '' : 'line-clamp-2'
                }`}>
                  {article.summary}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                </div>
                
                <span className="px-2 py-1 bg-gray-100 rounded-lg font-medium">
                  {article.source}
                </span>
                
                {article.segment && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg">
                    {article.segment}
                  </span>
                )}
                
                {article.region && (
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                    {article.region}
                  </span>
                )}
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <div className="flex gap-1">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {article.quality_score && (
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg">
                    质量: {article.quality_score}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FavoriteButton articleId={article.id} />
              
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="查看原文"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}