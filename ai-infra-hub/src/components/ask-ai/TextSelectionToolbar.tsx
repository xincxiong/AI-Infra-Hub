'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Copy, Share2 } from 'lucide-react';

interface TextSelectionToolbarProps {
  onAskAI: (text: string) => void;
}

export default function TextSelectionToolbar({ onAskAI }: TextSelectionToolbarProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 5) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        // 计算工具栏位置（显示在选中文本上方居中）
        const x = rect.left + rect.width / 2;
        const y = rect.top - 50; // 上方 50px
        
        setPosition({ x, y });
        setSelectedText(text);
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, []);

  const handleClickOutside = useCallback(() => {
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    // 监听鼠标抬起事件
    document.addEventListener('mouseup', handleSelection);
    // 监听点击外部关闭
    document.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-toolbar')) {
        handleClickOutside();
      }
    });
    // 监听滚动隐藏
    document.addEventListener('scroll', handleClickOutside, true);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleClickOutside, true);
    };
  }, [handleSelection, handleClickOutside]);

  const handleAskAI = () => {
    onAskAI(selectedText);
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (!isVisible || !position) return null;

  return (
    <div
      className="selection-toolbar fixed z-50 animate-fade-in-up"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-center gap-1 bg-gray-900 text-white rounded-xl shadow-2xl px-2 py-1.5">
        <button
          onClick={handleAskAI}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">问问 AI</span>
        </button>
        
        <div className="w-px h-5 bg-gray-700 mx-1" />
        
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="复制"
        >
          <Copy className="w-4 h-4" />
        </button>
        
        <button
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="分享"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* 小三角形箭头 */}
      <div 
        className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 transform -translate-x-1/2 rotate-45"
      />

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
