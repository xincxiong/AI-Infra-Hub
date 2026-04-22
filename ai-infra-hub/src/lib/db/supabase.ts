import { createClient } from '@supabase/supabase-js'

// 懒加载 Supabase 客户端（避免构建时初始化）
let _supabaseClient: ReturnType<typeof createClient> | null = null
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabaseClient
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

// 向后兼容的导出（仅在运行时使用）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseClient = new Proxy({} as any, {
  get: (_: any, prop: string) => {
    const client = getSupabaseClient()
    return (client as any)[prop]
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = new Proxy({} as any, {
  get: (_: any, prop: string) => {
    const client = getSupabaseAdmin()
    return (client as any)[prop]
  },
})

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      daily_reports: {
        Row: {
          id: string
          type: 'market' | 'tech' | 'product'
          report_date: string
          title: string
          summary: string
          highlights: unknown[]
          insights: unknown[]
          sections: unknown[]
          status: 'draft' | 'published'
          quality_score: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['daily_reports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['daily_reports']['Insert']>
      }
      raw_articles: {
        Row: {
          id: string
          url: string
          source: string
          date: string
          title: string
          summary: string | null
          content: string | null
          region: string | null
          segment: string | null
          tags: string[] | null
          event_type: string | null
          entities: unknown | null
          raw_data: unknown | null
          verified: boolean
          quality_score: number | null
          verification_details: unknown | null
          crawled_at: string
          created_at: string
        }
        Insert: Omit<Tables['raw_articles']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['raw_articles']['Insert']>
      }
      ask_ai_sessions: {
        Row: {
          id: string
          user_id: string | null
          report_id: string
          selected_text: string
          user_question: string | null
          ai_response: string
          sources: unknown[] | null
          related_items: string[] | null
          created_at: string
        }
        Insert: Omit<Tables['ask_ai_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['ask_ai_sessions']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['users']['Insert']>
      }
    }
  }
}

// 辅助类型
type Tables = Database['public']['Tables']