-- AI Infra Hub 数据库 Schema
-- 适用于 Supabase PostgreSQL

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 用户表 ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 日报主表 ====================
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('market', 'tech', 'product')),
  report_date DATE NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  insights JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, report_date)
);

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_type ON daily_reports(type);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);

-- ==================== 原始文章表 ====================
CREATE TABLE raw_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 时间与事实锚点（去重和溯源）
  url TEXT NOT NULL,
  source VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  
  -- 内容表达层
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  content TEXT,
  
  -- 业务分析维度
  region VARCHAR(50),
  segment VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  event_type VARCHAR(50),
  
  -- 其他字段
  entities JSONB,
  raw_data JSONB,
  verified BOOLEAN DEFAULT false,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  verification_details JSONB,
  
  -- 时间戳
  crawled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 去重索引
CREATE UNIQUE INDEX idx_raw_articles_url ON raw_articles(url);
CREATE UNIQUE INDEX idx_raw_articles_title_domain ON raw_articles(
  lower(regexp_replace(title, '[^a-zA-Z0-9\u4e00-\u9fa5]', '', 'g')),
  source
);

-- 查询索引
CREATE INDEX idx_raw_articles_date ON raw_articles(date);
CREATE INDEX idx_raw_articles_source ON raw_articles(source);
CREATE INDEX idx_raw_articles_region ON raw_articles(region);
CREATE INDEX idx_raw_articles_segment ON raw_articles(segment);
CREATE INDEX idx_raw_articles_event_type ON raw_articles(event_type);
CREATE INDEX idx_raw_articles_tags ON raw_articles USING GIN(tags);
CREATE INDEX idx_raw_articles_verified ON raw_articles(verified);
CREATE INDEX idx_raw_articles_quality_score ON raw_articles(quality_score DESC);

-- ==================== ASK AI 会话表 ====================
CREATE TABLE ask_ai_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
  selected_text TEXT NOT NULL,
  user_question TEXT,
  ai_response TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  related_items UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ask_ai_user ON ask_ai_sessions(user_id);
CREATE INDEX idx_ask_ai_report ON ask_ai_sessions(report_id);
CREATE INDEX idx_ask_ai_created_at ON ask_ai_sessions(created_at DESC);

-- ==================== 用户收藏表 ====================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES raw_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);

-- ==================== 搜索关键词配置表 ====================
CREATE TABLE search_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('product', 'tech', 'market')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  target_types TEXT[] DEFAULT '{market,tech,product}',
  source_preference VARCHAR(20) DEFAULT 'auto' CHECK (source_preference IN ('auto', 'tavily', 'openai', 'aliyun')),
  search_interval INTEGER DEFAULT 3600, -- 秒
  is_active BOOLEAN DEFAULT true,
  last_searched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_keywords_priority ON search_keywords(priority DESC, last_searched_at);
CREATE INDEX idx_search_keywords_active ON search_keywords(is_active, last_searched_at);

-- ==================== 搜索成本监控表 ====================
CREATE TABLE search_cost_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(20) NOT NULL CHECK (source IN ('tavily', 'openai', 'aliyun')),
  search_date DATE NOT NULL,
  search_count INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, search_date)
);

CREATE INDEX idx_search_cost_source_date ON search_cost_monitoring(source, search_date);
CREATE INDEX idx_search_cost_date ON search_cost_monitoring(search_date);

-- 每日成本汇总视图
CREATE VIEW daily_cost_summary AS
SELECT
  search_date,
  source,
  search_count,
  total_cost,
  total_tokens,
  SUM(total_cost) OVER (PARTITION BY search_date) as daily_total,
  SUM(total_tokens) OVER (PARTITION BY search_date) as daily_tokens
FROM search_cost_monitoring;

-- ==================== RLS 策略（行级安全）====================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 日报表策略（公开读取）
CREATE POLICY "Daily reports are viewable by everyone" ON daily_reports
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage daily reports" ON daily_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 原始文章策略（公开读取已验证的）
CREATE POLICY "Verified articles are viewable by everyone" ON raw_articles
  FOR SELECT USING (verified = true);

CREATE POLICY "Admins can manage raw articles" ON raw_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ASK AI 会话策略
CREATE POLICY "Users can view own sessions" ON ask_ai_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions" ON ask_ai_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 用户收藏策略
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (user_id = auth.uid());

-- 插入示例搜索关键词
INSERT INTO search_keywords (keyword, category, priority, target_types, source_preference) VALUES
-- 产品类 (高优先级)
('OpenAI GPT release launch update', 'product', 10, '{market,product}', 'tavily'),
('Anthropic Claude new version', 'product', 9, '{market,product}', 'tavily'),
('Google Gemini AI announcement', 'product', 9, '{market,product}', 'tavily'),
('Meta Llama model release', 'product', 8, '{market,product}', 'tavily'),
('AI startup funding Series', 'product', 7, '{market,product}', 'tavily'),
('AI Agent product launch', 'product', 8, '{market,product}', 'tavily'),

-- 技术类
('LLM architecture transformer paper', 'tech', 9, '{tech}', 'openai'),
('KV Cache optimization inference', 'tech', 8, '{tech}', 'tavily'),
('vLLM TensorRT release', 'tech', 8, '{tech}', 'tavily'),
('RAG retrieval augmented generation', 'tech', 7, '{tech}', 'tavily'),
('arXiv cs.AI large language model', 'tech', 6, '{tech}', 'tavily'),

-- 中文关键词
('通义千问模型', 'tech', 8, '{tech}', 'aliyun'),
('阿里云百炼产品', 'product', 8, '{tech,product}', 'aliyun'),
('国产大模型动态', 'tech', 7, '{tech}', 'aliyun');