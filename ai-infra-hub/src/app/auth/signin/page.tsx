import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/')
  }

  const providers = [
    { id: 'google', name: 'Google', icon: 'G' },
    { id: 'github', name: 'GitHub', icon: 'GH' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">AI Infra Hub</h1>
          <p className="text-gray-500 mt-2">登录以获取更多 AI 额度</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm">
          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold">
                  {provider.icon}
                </div>
                <span>使用 {provider.name} 登录</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            登录后每天可获得 100 次 AI 问答额度
          </p>
        </div>
      </div>
    </div>
  )
}
