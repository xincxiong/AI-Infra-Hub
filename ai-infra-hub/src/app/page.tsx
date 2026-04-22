'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, Filter } from 'lucide-react';
import { AskAISidebar, TextSelectionToolbar } from '@/components/ask-ai';

type ReportType = 'market' | 'tech' | 'product';
type CategoryKey = 'market' | 'tech' | 'product';

const REPORT_CATEGORIES: Record<CategoryKey, string[]> = {
  market: ['融资', '产品', '合作', '政策'],
  tech: ['模型', '工程', '论文'],
  product: ['云厂商', '模型厂商', '芯片厂商', '创业公司'],
};

interface Report {
  id: string;
  type: ReportType;
  title: string;
  summary: string;
  highlights: Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    tag?: string;
  }>;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    impact: string;
  }>;
  sections: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      title: string;
      summary: string;
      source: string;
      url: string;
    }>;
  }>;
}

export default function Home() {
  const [reportType, setReportType] = useState<ReportType>('market');
  const [selectedDate, setSelectedDate] = useState('2026-04-13');
  const [selectedFilter, setSelectedFilter] = useState<string>('全部');
  const [showAskAI, setShowAskAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const reportTypeNames: Record<ReportType, string> = {
    market: '市场动态',
    tech: '技术动态',
    product: '产品动态'
  };

  const filterOptions = REPORT_CATEGORIES[reportType];

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?type=${reportType}&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        setReport(getMockReport());
      }
    } catch {
      setReport(getMockReport());
    }
    setLoading(false);
  }, [reportType, selectedDate]);

  useEffect(() => {
    fetchReport();
    setSelectedFilter('全部');
  }, [fetchReport]);

  const getMockReport = (): Report => {
    const categories = REPORT_CATEGORIES[reportType]
    const mockHighlights: Record<ReportType, { id: string; title: string; summary: string; source: string; url: string; tag: string }[]> = {
      market: [
        { id: '1', title: 'Anthropic 获得 20 亿美元融资', summary: '估值达到 600 亿美元。', source: 'TechCrunch', url: '#', tag: '融资' },
        { id: '2', title: 'OpenAI 发布 GPT-4 Turbo 新版本', summary: '推理速度提升 50%，成本降低 30%。', source: 'OpenAI Blog', url: '#', tag: '产品' },
        { id: '3', title: '微软与 OpenAI 深化合作', summary: '追加投资并共享独家技术。', source: 'Reuters', url: '#', tag: '合作' },
        { id: '4', title: '美国发布 AI 监管政策', summary: '白宫发布最新 AI 行政令。', source: 'White House', url: '#', tag: '政策' },
      ],
      tech: [
        { id: '1', title: 'GPT-4o 发布', summary: '多模态能力大幅提升。', source: 'OpenAI', url: '#', tag: '模型' },
        { id: '2', title: 'Meta 发布 Llama 3', summary: '开源大模型新标杆。', source: 'Meta', url: '#', tag: '模型' },
        { id: '3', title: 'DeepMind 发布新论文', summary: '训练效率提升 40%。', source: 'arXiv', url: '#', tag: '论文' },
        { id: '4', title: 'Agent 框架最新研究', summary: '自主智能体进展。', source: 'GitHub', url: '#', tag: '工程' },
      ],
      product: [
        { id: '1', title: 'AWS 发布新 AI 服务', summary: 'Bedrock 全面升级。', source: 'AWS', url: '#', tag: '云厂商' },
        { id: '2', title: 'OpenAI 推出企业版', summary: '企业级安全和定制。', source: 'OpenAI', url: '#', tag: '模型厂商' },
        { id: '3', title: 'NVIDIA H200 芯片上市', summary: '内存翻倍提升。', source: 'NVIDIA', url: '#', tag: '芯片厂商' },
        { id: '4', title: 'Mistral AI 新产品发布', summary: '开源模型新选择。', source: 'Mistral', url: '#', tag: '创业公司' },
      ],
    }

    const mockSections = categories.map((category, index) => ({
      id: `section-${category}`,
      name: category,
      items: [
        { id: `item-${index}-1`, title: `${category}动态 1`, summary: '相关资讯摘要', source: 'TechCrunch', url: '#' },
        { id: `item-${index}-2`, title: `${category}动态 2`, summary: '相关资讯摘要', source: 'The Verge', url: '#' },
      ],
    }))

    return {
      id: 'demo',
      type: reportType,
      title: `${reportTypeNames[reportType]} - ${selectedDate}`,
      summary: `今日共收录 ${categories.length * 2} 条${reportTypeNames[reportType]}资讯。`,
      highlights: mockHighlights[reportType],
      insights: [
        { id: '1', title: '行业趋势加速', description: '今日动态显示行业正在快速发展。', impact: '建议密切关注。' },
        { id: '2', title: '技术竞争加剧', description: '主要厂商持续推出新产品。', impact: '评估差异化。' },
        { id: '3', title: '投资机会显现', description: '新兴方向值得关注。', impact: '建议深入研究。' },
      ],
      sections: mockSections,
    }
  };

  const handleAskAIClick = (text: string) => {
    setSelectedText(text);
    setShowAskAI(true);
  };

  const resetAskAI = () => {
    setShowAskAI(false);
    setSelectedText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-blue-600 animate-pulse" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">AI Infra Hub</h1>
                <p className="text-sm text-gray-500">AI 行业专业日报</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
              {(['market', 'tech', 'product'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    reportType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {reportTypeNames[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
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

        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold text-gray-900 mb-5 tracking-tight">{report.title}</h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">{report.summary}</p>
          <div className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>发布于 {new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

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

        {!showAskAI && (
          <button
            onClick={() => setShowAskAI(true)}
            className="fixed bottom-8 right-8 bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center gap-2.5 z-30"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold tracking-tight">ASK AI</span>
          </button>
        )}

        <TextSelectionToolbar onAskAI={handleAskAIClick} />
        
        <AskAISidebar
          isOpen={showAskAI}
          onClose={resetAskAI}
          selectedText={selectedText}
          reportTitle={report?.title || ''}
          reportType={reportType}
        />
      </main>

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