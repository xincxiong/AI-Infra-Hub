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
export const supabaseClient = new Proxy({} as SupabaseClient, {
  get: (_target: SupabaseClient, prop: string) => {
    const client = getSupabaseClient()
    return (client as never)[prop]
  },
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_target: SupabaseClient, prop: string) => {
    const client = getSupabaseAdmin()
    return (client as never)[prop]
  },
})

// Type-safe client with Database schema
export type SupabaseTable = keyof Database['public']['Tables']
export type SupabaseClient = ReturnType<typeof createClient>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbAny = any

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
        Insert: {
          type: 'market' | 'tech' | 'product'
          report_date: string
          title: string
          summary: string
          highlights?: unknown[]
          insights?: unknown[]
          sections?: unknown[]
          status?: 'draft' | 'published'
          quality_score: number
          published_at?: string | null
        }
        Update: Partial<Record<keyof Database['public']['Tables']['daily_reports']['Row'], unknown>>
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
        Insert: {
          url: string
          source: string
          date: string
          title: string
          summary?: string | null
          content?: string | null
          region?: string | null
          segment?: string | null
          tags?: string[] | null
          event_type?: string | null
          entities?: unknown | null
          raw_data?: unknown | null
          verified?: boolean
          quality_score?: number | null
          verification_details?: unknown | null
        }
        Update: Partial<Record<keyof Database['public']['Tables']['raw_articles']['Row'], unknown>>
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
        Insert: {
          user_id?: string | null
          report_id: string
          selected_text: string
          user_question?: string | null
          ai_response: string
          sources?: unknown[] | null
          related_items?: string[] | null
        }
        Update: Partial<Record<keyof Database['public']['Tables']['ask_ai_sessions']['Row'], unknown>>
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
        Insert: {
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
        Update: Partial<Record<keyof Database['public']['Tables']['users']['Row'], unknown>>
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          article_id: string
        }
        Update: Partial<Record<keyof Database['public']['Tables']['user_favorites']['Row'], unknown>>
      }
      search_keywords: {
        Row: {
          id: string
          keyword: string
          category: string
          priority: number
          target_types: string[]
          source_preference: string
          search_interval: number
          is_active: boolean
          last_searched_at: string | null
          created_at: string
        }
        Insert: {
          keyword: string
          category: string
          priority?: number
          target_types?: string[]
          source_preference?: string
          search_interval?: number
          is_active?: boolean
        }
        Update: Partial<Record<keyof Database['public']['Tables']['search_keywords']['Row'], unknown>>
      }
    }
  }
}