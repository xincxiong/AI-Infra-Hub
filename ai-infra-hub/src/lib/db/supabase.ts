import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 客户端使用的 Supabase 实例（受 RLS 限制）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 服务端使用的 Supabase 实例（绕过 RLS）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
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
          highlights: any[]
          insights: any[]
          sections: any[]
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
          entities: any | null
          raw_data: any | null
          verified: boolean
          quality_score: number | null
          verification_details: any | null
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
          sources: any[] | null
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