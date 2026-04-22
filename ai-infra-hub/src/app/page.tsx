'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { AskAISidebar, TextSelectionToolbar } from '@/components/ask-ai';

interface Report {
  id: string;
  type: 'market' | 'tech' | 'product';
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
  const [reportType, setReportType] = useState<'market' | 'tech' | 'product'>('market');
  const [selectedDate] = useState(() => {
    // 默认选择今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [showAskAI, setShowAskAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const reportTypeNames = {
    market: '市场动态',
    tech: '技术动态',
    product: '产品动态'
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

  const getMockReport = (): Report => ({
    id: 'demo',
    type: reportType,
    title: `${reportTypeNames[reportType]} - ${selectedDate}`,
    summary: `今日共收录 15 条${reportTypeNames[reportType]}资讯。`,
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
    sections: [
      {
        id: 'section-1',
        name: '大模型动态',
        items: [
          { id: 'item-1', title: 'GPT-4 Turbo 更新', summary: '性能提升', source: 'OpenAI', url: '#' },
          { id: 'item-2', title: 'Claude 3.5 发布', summary: '代码能力增强', source: 'Anthropic', url: '#' }
        ]
      },
      {
        id: 'section-2',
        name: '硬件更新',
        items: [
          { id: 'item-3', title: 'NVIDIA H200', summary: '内存翻倍', source: 'NVIDIA', url: '#' }
        ]
      }
    ]
  });



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
        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold text-gray-900 mb-5">{report.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{report.summary}</p>
        </div>

        <section className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8">重点关注</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {report.highlights.map((h) => (
              <div key={h.id} className="bg-white rounded-2xl p-7 border border-gray-200/60">
                {h.tag && <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full mb-4">{h.tag}</span>}
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{h.title}</h4>
                <p className="text-gray-600 mb-4">{h.summary}</p>
                <a href={h.url} className="text-blue-600 text-sm">查看原文</a>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8">详细更新</h3>
          {report.sections.map((section) => (
            <div key={section.id} className="mb-10">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">{section.name}</h4>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-200/60">
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h5>
                    <p className="text-gray-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {!showAskAI && (
          <button
            onClick={() => setShowAskAI(true)}
            className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-full shadow-xl z-30"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            ASK AI
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
    </div>
  );
}
