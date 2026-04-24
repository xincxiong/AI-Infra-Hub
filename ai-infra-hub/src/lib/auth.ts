import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

const providers = [
  // Google 登录
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // GitHub 登录
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
]

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  callbacks: {
    async signIn({ user }) {
      // 用户首次登录时，自动创建用户记录
      if (!user.email) {
        return true
      }
      
      // 懒加载 Supabase Admin，避免构建时初始化
      const { supabaseAdmin } = await import('./db/supabase')
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingUser } = await (supabaseAdmin as any)
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (!existingUser) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseAdmin as any).from('users').insert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            role: 'user',
          })
        }
      } catch (error) {
        console.error('创建用户失败:', error)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
