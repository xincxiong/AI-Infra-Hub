'use client';

import { useState } from 'react';
import { DailyReport, getReport, getAvailableDates } from '@/lib/data/mockData';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Clock, ExternalLink, Filter } from 'lucide-react';
import { AskAISidebar, TextSelectionToolbar } from './components/ask-ai';

export default function Home() {
  const [reportType, setReportType] = useState<'market' | 'tech' | 'product'>('market');
  const [selectedDate, setSelectedDate] = useState('2026-04-12');
  const [selectedFilter, setSelectedFilter] = useState<string>('全部');
  const [showAskAI, setShowAskAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const report = getReport(reportType, selectedDate);
  const availableDates = getAvailableDates(reportType);

  const reportTypeNames = {
    market: '市场动态',
    tech: '技术动态',
    product: '产品动态'
  };

  const reportTypeDescriptions = {
    market: '面向投资人和企业决策者，聚焦融资、产品、合作、政策动态',
    tech: '面向工程师和研究者，聚焦模型、工程、论文动态',
    product: '面向产品经理和创业者，聚焦云厂商、模型厂商、芯片厂商、创业公司动态'
  };

  const filterOptions = report?.sections.map(s => s.name) || [];

  const handleAskAIClick = (text: string) => {
    setSelectedText(text);
    setShowAskAI(true);
  };

  const resetAskAI = () => {
    setShowAskAI(false);
    setSelectedText('');
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/80 to-indigo-900/90 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">AI 市场日报</h1>
          <p className="text-xl">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">AI Infra Hub</h1>
                <p className="text-sm text-gray-500">AI 行业专业日报</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
              {(['market', 'tech', 'product'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setReportType(type);
                    setSelectedDate('2026-04-12');
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    reportType === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {reportTypeNames[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 日期导航 */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-xl shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-gray-900 font-medium">{selectedDate}</span>
          </div>
          <button
            className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 日报标题和摘要 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-gray-600 text-sm mb-6 shadow-sm">
            <span>{reportTypeNames[reportType]}</span>
            <span className="text-gray-300">•</span>
            <span>{reportTypeDescriptions[reportType]}</span>
          </div>
          <h2 className="text-5xl font-semibold text-gray-900 mb-5 tracking-tight">{report.title}</h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">{report.summary}</p>
          <div className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>发布于 {new Date(report.publishedAt).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* 重点关注 */}
        <section className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            重点关注
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {report.highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="bg-white rounded-2xl p-7 hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200/60"
              >
                {highlight.tag && (
                  <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-4">
                    {highlight.tag}
                  </span>
                )}
                <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {highlight.title}
                </h4>
                <p className="text-gray-600 text-base leading-relaxed mb-4">{highlight.summary}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{highlight.source}</span>
                  <a
                    href={highlight.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    查看原文
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 洞察建议 */}
        <section className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            洞察建议
          </h3>
          <div className="space-y-5">
            {report.insights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white rounded-2xl p-7 border border-gray-200/60"
              >
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{insight.title}</h4>
                <p className="text-gray-600 text-base leading-relaxed mb-4">{insight.description}</p>
                <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-green-600">
                  <p className="text-base text-gray-800 font-medium">{insight.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 详细更新 */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <Filter className="w-4 h-4 text-white" />
              </div>
              详细更新
            </h3>
            <div className="flex gap-1.5 bg-gray-100/80 rounded-xl p-1">
              <button
                onClick={() => setSelectedFilter('全部')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === '全部'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                全部
              </button>
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {report.sections
            .filter(section => selectedFilter === '全部' || section.name === selectedFilter)
            .map((section) => (
              <div key={section.id} className="mb-10">
                <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                  {section.name}
                </h4>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300"
                    >
                      <h5 className="text-lg font-semibold text-gray-900 mb-2.5">{item.title}</h5>
                      <p className="text-gray-600 text-base leading-relaxed mb-4">{item.summary}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">{item.source}</span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                        >
                          查看原文
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* ASK AI 悬浮按钮 */}
        {!showAskAI && (
          <button
            onClick={() => setShowAskAI(true)}
            className="fixed bottom-8 right-8 bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-2.5 z-30"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold tracking-tight">ASK AI</span>
          </button>
        )}

        {/* 文字选中浮动工具栏 */}
        <TextSelectionToolbar onAskAI={handleAskAIClick} />

        {/* ASK AI 侧边栏 */}
        <AskAISidebar
          isOpen={showAskAI}
          onClose={resetAskAI}
          selectedText={selectedText}
          reportTitle={report?.title || ''}
          reportType={reportType}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 py-10 mt-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-base">
            © 2026 AI Infra Hub. 数据来源：OpenAI、NVIDIA、Anthropic 等 130+ 权威数据源
          </p>
        </div>
      </footer>
    </div>
  );
}
