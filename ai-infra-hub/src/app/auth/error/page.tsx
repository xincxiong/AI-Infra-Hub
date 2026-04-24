export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">登录出错</h1>
        <p className="text-gray-500 mb-8">无法完成身份验证，请重试</p>

        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm space-y-3">
          <a
            href="/auth/signin"
            className="block w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors font-medium"
          >
            重新登录
          </a>
          <a
            href="/"
            className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
