# AI Infra Hub - 部署指导手册

> 📋 完整部署指南 | 版本：v2.0 | 最后更新：2026-04-22

---

## 📖 目录

1. [项目概述](#项目概述)
2. [部署前准备](#部署前准备)
3. [环境配置](#环境配置)
4. [数据库初始化](#数据库初始化)
5. [Vercel 部署](#vercel-部署)
6. [功能测试](#功能测试)
7. [定时任务配置](#定时任务配置)
8. [监控与维护](#监控与维护)
9. [故障排查](#故障排查)

---

## 项目概述

### 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| **前端** | Next.js 14 + Tailwind CSS | 用户界面 |
| **后端** | Next.js API Routes | 业务逻辑 |
| **数据库** | Supabase PostgreSQL | 数据存储 |
| **缓存** | Upstash Redis | 额度管理、会话缓存 |
| **AI** | 阿里云百炼 (glm-5) | 智能问答、内容生成 |
| **数据采集** | Tavily API + 阿里云百炼 | 资讯搜索 |
| **部署** | Vercel | 托管平台 |
| **认证** | NextAuth.js | 用户登录 |

### 核心功能

- ✅ 三种日报类型（市场/技术/产品）
- ✅ Joker AI 智能问答（选中文字触发）
- ✅ 数据采集与自动日报生成
- ✅ 定时任务（每日凌晨 3 点）
- ✅ 用户认证与额度管理

---

## 部署前准备

### 1. Supabase (数据库)

**步骤：**

1. 访问 https://supabase.com
2. 使用 GitHub 账号登录
3. 点击 **"New Project"**
4. 填写项目信息：
   - **Name**: `ai-infra-hub`
   - **Region**: `East Asia (Singapore)` (推荐)
   - **Database Password**: 自动生成（保存好）
5. 等待 2-3 分钟创建完成

**获取配置信息：**

进入 **Project Settings** → **Database**：
- 复制 `Connection string` (Session pooler)
- 复制 `Project URL`
- 复制 `anon public` API Key
- 进入 **Project Settings** → **API** 复制 `service_role` Key

**费用：** 免费额度 500MB，足够 MVP 使用

---

### 2. Upstash (Redis 缓存)

**步骤：**

1. 访问 https://upstash.com
2. 使用 GitHub 账号登录
3. 点击 **"Create Database"**
4. 配置：
   - **Name**: `ai-infra-hub-redis`
   - **Type**: `Global` (低延迟)
   - **Region**: `Singapore` (与 Supabase 一致)
5. 点击 **"Create"**

**获取配置信息：**

进入 Database 详情页，复制：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**费用：** 免费额度 10K ops/天，足够 MVP 使用

---

### 3. 阿里云百炼 (AI 服务)

**步骤：**

1. 访问 https://bailian.console.aliyun.com
2. 使用阿里云账号登录
3. 进入 **API Key 管理**
4. 点击 **"创建新的 API Key"**
5. 复制 Key（只显示一次！）

**开通模型：**

1. 进入 **模型广场**
2. 找到 `glm-5` 或 `qwen-plus`
3. 点击 **"开通服务"**

**费用：** 按量计费，约 ¥0.002/千 tokens

---

### 4. Tavily (数据采集，可选但推荐)

**步骤：**

1. 访问 https://tavily.com
2. 使用 GitHub 账号登录
3. 进入 **Dashboard** → **API Keys**
4. 创建新的 API Key

**费用：** 免费 1000 次/月

---

### 5. OAuth 认证（可选，用于用户登录）

**Google OAuth:**

1. 访问 https://console.cloud.google.com/apis/credentials
2. 创建新项目
3. 创建 **OAuth 2.0 Client ID**
4. 复制 `Client ID` 和 `Client Secret`

**GitHub OAuth:**

1. 访问 https://github.com/settings/developers
2. 创建 **New OAuth App**
3. 复制 `Client ID` 和生成 `Client Secret`

---

## 环境配置

### 环境变量清单

创建 `.env.local` 文件（本地开发）或在 Vercel 中配置：

```bash
# ==================== 必需配置 ====================

# 阿里云百炼 API Key
ALIYUN_BAILIAN_API_KEY=

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis 配置
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ==================== 可选配置 ====================

# Tavily API (数据采集)
TAVILY_API_KEY=

# NextAuth 认证 (用户登录)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# 定时任务密钥 (保护 Cron API)
CRON_SECRET=

# 应用配置
NEXT_PUBLIC_APP_NAME=AI Infra Hub
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 生成 NextAuth Secret

```bash
openssl rand -base64 32
```

---

## 数据库初始化

### 执行 SQL 迁移

1. 进入 **Supabase Dashboard** → **SQL Editor**
2. 点击 **"New Query"**
3. 复制项目中的 `src/lib/db/schema.sql` 全部内容
4. 粘贴到 SQL Editor
5. 点击 **"Run"** 或按 `Cmd/Ctrl + Enter`

**验证表已创建：**

进入 **Table Editor**，确认以下表存在：
- ✅ `users` - 用户表
- ✅ `daily_reports` - 日报主表
- ✅ `raw_articles` - 原始文章表
- ✅ `ask_ai_sessions` - AI 会话表

### 插入测试数据（可选）

```sql
-- 插入测试用户
INSERT INTO users (email, name, role) VALUES 
  ('test@example.com', 'Test User', 'user');

-- 插入测试日报
INSERT INTO daily_reports (type, report_date, title, summary, status) VALUES
  ('market', '2026-04-22', 'AI 市场动态测试', '测试数据', 'published');
```

---

## Vercel 部署

### 1. 推送代码到 GitHub

```bash
cd "/Users/apple/Documents/work/产品设计/ai-trends-hub/workbuddy-design-demo"
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. 创建 Vercel 项目

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **"Add New Project"**
4. 选择 **"Import Git Repository"**
5. 找到 `AI-Infra-Hub` 仓库
6. 点击 **"Import"**

### 3. 配置项目

**Configure Project:**

- **Framework Preset**: `Next.js`
- **Root Directory**: `./ai-infra-hub` (如果代码在子目录)
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. 配置环境变量

在 **Project Settings** → **Environment Variables** 中添加：

| Key | Value | Environment |
|-----|-------|-------------|
| `ALIYUN_BAILIAN_API_KEY` | 你的阿里云 Key | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Key | Production |
| `UPSTASH_REDIS_REST_URL` | Upstash URL | Production |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Token | Production |
| `TAVILY_API_KEY` | Tavily Key (可选) | Production |
| `CRON_SECRET` | 自定义密钥 | Production |

### 5. 部署

1. 点击 **"Deploy"**
2. 等待 2-3 分钟
3. 部署完成后会显示预览 URL

### 6. 配置自定义域名（可选）

1. 进入 **Project Settings** → **Domains**
2. 点击 **"Add"**
3. 输入你的域名
4. 按照提示配置 DNS 记录

---

## 功能测试

### 基础功能测试清单

访问部署后的域名，逐项测试：

#### 首页功能
- [ ] 页面正常加载
- [ ] 三种日报类型切换正常
- [ ] 日期导航功能正常
- [ ] 重点关注卡片显示正常
- [ ] 洞察建议显示正常

#### Joker AI 功能
- [ ] 选中文字触发浮动工具栏
- [ ] 点击 "问问 AI" 打开侧边栏
- [ ] AI 摘要生成正常
- [ ] 输入问题得到回答
- [ ] 流式响应正常（逐字显示）
- [ ] 引用来源显示正常

#### 用户功能（如配置认证）
- [ ] Google/GitHub 登录正常
- [ ] 用户额度显示正常
- [ ] 会话历史查看正常

### API 测试

**测试日报 API:**

```bash
curl https://your-app.vercel.app/api/reports?type=market&date=2026-04-22
```

**测试 Joker AI API:**

```bash
curl -X POST https://your-app.vercel.app/api/ask-ai \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "test-id",
    "selectedText": "OpenAI 发布 GPT-4 Turbo",
    "question": "这是什么意思？"
  }'
```

**测试额度查询:**

```bash
curl https://your-app.vercel.app/api/credits
```

---

## 定时任务配置

### Vercel Cron 配置

项目已包含 `vercel.json` 配置文件：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-report?type=all",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**执行时间：** 每日凌晨 3:00 UTC（北京时间 11:00 AM）

如需调整为北京时间凌晨 3 点，修改为：
```json
"schedule": "0 19 * * *"
```

### 手动触发测试

```bash
curl -H "Authorization: Bearer your-cron-secret" \
     https://your-app.vercel.app/api/cron/daily-report?type=all
```

### 验证数据采集

1. 进入 **Supabase Dashboard** → **Table Editor**
2. 查看 `raw_articles` 表是否有新数据
3. 查看 `daily_reports` 表是否生成日报

---

## 监控与维护

### 成本监控

**预估月度成本：**

| 服务 | 免费额度 | 预估用量 | 费用 |
|------|----------|----------|------|
| Vercel | 100GB | 50GB | $0 |
| Supabase | 500MB | 200MB | $0 |
| Upstash | 10K ops/天 | 5K ops/天 | $0 |
| 阿里云百炼 | - | ~20M tokens | ~¥100 |
| Tavily | 1000 次/月 | 500 次/月 | $0 |
| **合计** | - | - | **~¥100/月** |

### 设置预算告警

**阿里云百炼：**

1. 进入 **费用中心** → **预算管理**
2. 创建预算：¥200/月
3. 设置告警阈值：80%

**Vercel：**

1. 进入 **Settings** → **Billing**
2. 设置 **Spending Limit**

### 日志查看

**Vercel 日志：**

1. 进入 **Project Dashboard**
2. 点击 **"Functions"** 标签
3. 查看 API 执行日志

**Supabase 日志：**

1. 进入 **Dashboard** → **Logs**
2. 查看数据库查询日志

---

## 故障排查

### 问题 1: 部署失败

**症状：** Vercel 构建失败

**解决：**

```bash
# 本地先测试构建
cd ai-infra-hub
npm run build

# 检查错误日志
# 常见原因：
# - 缺少环境变量
# - TypeScript 类型错误
# - 依赖缺失
```

### 问题 2: API 返回 500 错误

**症状：** 接口报错

**排查：**

1. Vercel Dashboard → Functions 查看日志
2. 检查环境变量是否正确设置
3. 确认 Supabase/Upstash 连接正常

**常见错误：**

```
Error: Missing environment variable: ALIYUN_BAILIAN_API_KEY
```
→ 在 Vercel 中添加对应环境变量

### 问题 3: AI 额度不足

**症状：** ASK AI 提示额度不足

**解决：**

1. 检查 Redis 额度计数
2. 确认用户额度未超限（100 次/天）
3. 检查阿里云百炼 API Key 余额

### 问题 4: 定时任务未执行

**症状：** 没有自动采集数据

**排查：**

1. 检查 Vercel Cron 是否启用
2. 查看 Vercel Functions 日志
3. 确认 `CRON_SECRET` 配置正确

---

## 后续优化建议

### 性能优化
- [ ] 启用 Vercel Edge Functions
- [ ] 配置图片优化 (next/image)
- [ ] 添加 Service Worker 缓存

### 功能增强
- [x] 数据采集服务
- [x] 定时任务
- [x] 用户认证
- [ ] 搜索功能 (Typesense)
- [ ] 用户收藏功能

### 监控告警
- [ ] 配置 Sentry 错误监控
- [ ] 设置 Uptime 监控
- [ ] 添加业务指标看板

---

## 快速检查清单

部署前请确认：

- [ ] Supabase 项目已创建，数据库表已初始化
- [ ] Upstash Redis 已创建
- [ ] 阿里云百炼 API Key 已获取
- [ ] 所有环境变量已配置
- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建并部署

部署后请测试：

- [ ] 首页正常访问
- [ ] Joker AI 功能正常
- [ ] API 接口正常
- [ ] 定时任务正常执行

---

**文档版本**: v2.0  
**最后更新**: 2026-04-22  
**维护者**: AI Infra Hub Team
