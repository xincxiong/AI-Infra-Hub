'use client';

import { signOut } from 'next-auth/react';
import { Sparkles, LogOut } from 'lucide-react';

export default function SignOutPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">AI Infra Hub</h1>
        <p className="text-gray-500 mb-8">确定要退出登录吗？</p>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm space-y-3">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            确认退出
          </button>
          <a
            href="/"
            className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium"
          >
            取消
          </a>
        </div>
      </div>
    </div>
  );
}
