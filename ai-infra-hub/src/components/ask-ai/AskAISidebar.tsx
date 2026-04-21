'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, Edit2, Copy, MoreHorizontal, ChevronDown, 
  Sparkles, Send, Mic, AtSign, Paperclip, Newspaper, Brain,
  Plus, BarChart3, Search, FileText, Zap, ArrowRight
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  sources?: { title: string; url: string }[];
  relatedItems?: { title: string; id: string }[];
  timestamp: Date;
}

interface AskAISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  reportTitle: string;
  reportType: string;
}

export default function AskAISidebar({ 
  isOpen, 
  onClose, 
  selectedText, 
  reportTitle,
  reportType 
}: AskAISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [creditsRemaining, setCreditsRemaining] = useState(45);
  const [selectedModel, setSelectedModel] = useState<'smart' | 'pro' | 'deep'>('smart');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 当有新选中文本时，自动生成 AI Summary
  useEffect(() => {
    if (selectedText && isOpen && messages.length === 0) {
      generateSummary();
    }
  }, [selectedText, isOpen]);

  const generateSummary = async () => {
    setIsLoading(true);
    
    try {
      // 调用后端 API
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: 'demo-report',
          selectedText,
          mode: 'summary',
        }),
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      const data = await response.json();
      
      const summaryMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.answer || '暂无摘要',
        sources: data.sources || [],
        relatedItems: data.relatedItems || [],
        timestamp: new Date(),
      };
      
      setMessages([summaryMessage]);
      setCreditsRemaining(data.creditsRemaining || 45);
    } catch (error) {
      console.error('生成摘要失败:', error);
      // 降级到本地生成
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `根据您选中的内容，这是关于「${reportTitle}」的关键信息摘要...`,
        sources: [],
        relatedItems: [],
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    }
    
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowSummary(false);

    try {
      // 调用后端 API
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: 'demo-report',
          selectedText,
          question: inputText,
          mode: selectedModel === 'deep' ? 'deep' : 'summary',
        }),
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer,
        sources: data.sources || [],
        relatedItems: data.relatedItems || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setCreditsRemaining(data.creditsRemaining || 0);
    } catch (error) {
      console.error('发送消息失败:', error);
      // 降级处理
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '抱歉，服务暂时不可用，请稍后重试。',
        sources: [],
        relatedItems: [],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsLoading(false);
  };

  const generateAIResponse = (question: string): string => {
    return `关于您的问题「${question}」，我来为您详细解答：

**背景分析：**
这段内容涉及的是当前 AI 行业的热点话题。从技术发展趋势来看，这代表了行业向更高效、更智能方向演进的重要信号。

**深度解读：**
1. **技术层面**：这采用了最新的架构优化方案，能够显著提升推理效率
2. **商业层面**：预计将对现有市场格局产生重要影响，可能催生新的商业模式
3. **应用层面**：用户可以期待更快的响应速度和更低的成本

**影响评估：**
• 短期影响：技术团队需要评估适配成本
• 中期影响：可能改变行业竞争格局
• 长期影响：推动整个行业向更高效能方向发展

**行动建议：**
建议您持续关注后续发展，并根据自身业务需求制定相应的技术规划。`;
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      analyze: '请对这段内容进行深度分析，包括技术背景、行业影响和未来趋势',
      search: '请搜索与这段内容相关的其他新闻和背景信息',
      summarize: '请将这段内容总结为 3-5 个关键要点',
    };
    
    setInputText(prompts[action] || '');
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowSummary(true);
    setInputText('');
    if (selectedText) {
      generateSummary();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              New Chat
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto">
          {/* 品牌区 */}
          <div className="px-6 py-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Joker AI</h2>
            <p className="text-sm text-gray-500 mt-1">一起来深入了解这篇日报内容</p>
          </div>

          {/* AI Summary 卡片 */}
          {showSummary && selectedText && messages.length > 0 && (
            <div className="px-4 mb-4">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-900">AI 智能摘要</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  根据当前选中内容，这是关于「{reportTitle.slice(0, 20)}...」的关键信息...
                </p>
                <div className="mt-3 pt-3 border-t border-indigo-100">
                  <p className="text-xs text-gray-500 mb-2">关键数据：</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white/70 rounded-md text-xs text-gray-600">
                      涉及: OpenAI, Anthropic
                    </span>
                    <span className="px-2 py-1 bg-white/70 rounded-md text-xs text-gray-600">
                      类型: 产品发布
                    </span>
                    <span className="px-2 py-1 bg-white/70 rounded-md text-xs text-gray-600">
                      领域: 大模型推理
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 额度提示条 */}
          <div className="px-4 mb-4">
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  AI 额度：本月剩余 {creditsRemaining}/100 次
                </span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                升级 Pro
              </button>
            </div>
          </div>

          {/* 对话历史 */}
          <div className="px-4 space-y-4 pb-4">
            {/* 显示选中的上下文 */}
            {selectedText && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1.5">当前上下文：</p>
                <p className="text-sm text-gray-700 line-clamp-3">"{selectedText}"</p>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[95%]">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      
                      {/* 引用来源 */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            引用来源
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, idx) => (
                              <a
                                key={idx}
                                href={source.url}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                              >
                                {source.title}
                                <ArrowRight className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 相关动态 */}
                      {message.relatedItems && message.relatedItems.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">相关动态</p>
                          <div className="space-y-1.5">
                            {message.relatedItems.map((item, idx) => (
                              <button
                                key={idx}
                                className="block text-xs text-gray-700 hover:text-blue-600 text-left"
                              >
                                • {item.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 加载状态 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    <span className="text-sm text-gray-500 ml-1">AI 正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 快捷操作栏 */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              新建
            </button>
            <button 
              onClick={() => handleQuickAction('analyze')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              深度分析
            </button>
            <button 
              onClick={() => handleQuickAction('search')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" />
              关联搜索
            </button>
            <button 
              onClick={() => handleQuickAction('summarize')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-full text-sm text-gray-700 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              总结要点
            </button>
          </div>
        </div>

        {/* 输入区 */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="relative">
            <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您想了解的问题..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-800 placeholder-gray-400 py-2 max-h-24 min-h-[40px]"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 底部工具栏 */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <AtSign className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Newspaper className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">
                  Current: {selectedText ? selectedText.slice(0, 15) + '...' : reportTitle.slice(0, 15) + '...'}
                </span>
              </button>
            </div>
            
            {/* 模型选择器 */}
            <div className="relative">
              <button 
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                {selectedModel === 'smart' ? 'Smart' : selectedModel === 'pro' ? 'Pro' : 'Deep'}
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showModelSelector && (
                <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                  {(['smart', 'pro', 'deep'] as const).map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelSelector(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors ${
                        selectedModel === model ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {model === 'smart' ? 'Smart' : model === 'pro' ? 'Pro' : 'Deep Research'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
