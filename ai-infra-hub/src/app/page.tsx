'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Clock, ExternalLink, Filter } from 'lucide-react';
import { AskAISidebar, TextSelectionToolbar } from '@/components/ask-ai';

interface Report {
  id: string;
  type: 'market' | 'tech' | 'product';
  title: string;
  summary: string;
  publishedAt?: string;
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
  const [reportType, setReportType] = useState<'market' | 'tech' | 'product'>('market');
  const [selectedDate, setSelectedDate] = useState(() => {
    // 默认选择今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedFilter, setSelectedFilter] = useState<string>('全部');
  const [showAskAI, setShowAskAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

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



  // 获取日报数据
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
  }, [fetchReport]);

  const getMockReport = (): Report => {
    // 根据报告类型生成不同的分类
    const sectionConfig: Record<'market' | 'tech' | 'product', string[]> = {
      market: ['融资', '产品', '合作', '政策'],
      tech: ['模型', '工程', '论文'],
      product: ['云厂商', '模型厂商', '芯片厂商', '创业公司']
    };

    const currentSections = sectionConfig[reportType];

    return {
      id: 'demo',
      type: reportType,
      title: `${reportTypeNames[reportType]} - ${selectedDate}`,
      summary: `今日共收录 15 条${reportTypeNames[reportType]}资讯。`,
      publishedAt: new Date().toISOString(),
      highlights: [
        {
          id: '1',
          title: 'OpenAI 发布 GPT-4 Turbo 新版本',
          summary: '推理速度提升 50%，成本降低 30%。',
          source: 'OpenAI Blog',
          url: '#',
          tag: '产品发布'
        },
        {
          id: '2',
          title: 'NVIDIA 推出新一代 AI 芯片',
          summary: 'H200 芯片内存容量翻倍。',
          source: 'NVIDIA News',
          url: '#',
          tag: '硬件更新'
        },
        {
          id: '3',
          title: 'Anthropic 获得 20 亿美元融资',
          summary: '估值达到 600 亿美元。',
          source: 'TechCrunch',
          url: '#',
          tag: '融资动态'
        },
        {
          id: '4',
          title: 'Google DeepMind 发布新论文',
          summary: '训练效率提升 40%。',
          source: 'arXiv',
          url: '#',
          tag: '技术论文'
        }
      ],
      insights: [
        {
          id: '1',
          title: '大模型竞争进入新阶段',
          description: '各大厂商持续加大投入。',
          impact: '建议关注技术发展趋势。'
        },
        {
          id: '2',
          title: 'AI 基础设施需求激增',
          description: '算力和存储需求持续增长。',
          impact: '云服务商迎来发展机遇。'
        },
        {
          id: '3',
          title: '投资热度持续高涨',
          description: 'AI 领域融资活跃。',
          impact: '行业整合加速。'
        }
      ],
      sections: currentSections.map(sectionName => ({
        id: `section-${sectionName}`,
        name: sectionName,
        items: [
          { 
            id: `item-${sectionName}-1`, 
            title: `${sectionName}动态示例 1`, 
            summary: `这是关于${sectionName}的具体资讯内容...`, 
            source: '权威媒体', 
            url: '#' 
          },
          { 
            id: `item-${sectionName}-2`, 
            title: `${sectionName}动态示例 2`, 
            summary: `这是关于${sectionName}的另一条资讯...`, 
            source: '行业媒体', 
            url: '#' 
          }
        ]
      }))
    };
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
                    setSelectedDate(new Date().toISOString().slice(0, 10));
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
            <span>发布于 {new Date(report.publishedAt || Date.now()).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
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
