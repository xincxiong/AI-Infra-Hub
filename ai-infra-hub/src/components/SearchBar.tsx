'use client'

import { useState } from 'react'
import { Search, X, Calendar, Tag, Filter } from 'lucide-react'

interface SearchBarProps {
  onSearch: (params: {
    query: string
    type?: string
    startDate?: string
    endDate?: string
    tags?: string
  }) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tags, setTags] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) return
    
    onSearch({
      query: query.trim(),
      type: type || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tags: tags || undefined
    })
  }

  const handleClear = () => {
    setQuery('')
    setType('')
    setStartDate('')
    setEndDate('')
    setTags('')
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {/* 主搜索框 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章标题或摘要..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          搜索
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          title="筛选条件"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* 筛选条件 */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 日报类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日报类型
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="market">市场动态</option>
              <option value="tech">技术动态</option>
              <option value="product">产品动态</option>
            </select>
          </div>

          {/* 开始日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              标签（逗号分隔）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如: OpenAI, GPT-5"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}