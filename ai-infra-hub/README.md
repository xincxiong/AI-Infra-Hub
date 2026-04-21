# AI Infra Hub

> AI 基础设施行业情报日报平台

## 🚀 项目简介

AI Infra Hub 是一个面向 AI 从业者、投资人和企业决策者的专业日报平台，每日汇总技术、市场、产品三个维度的 AI 行业动态。

### 核心功能

- 📊 **三种日报类型**：市场动态、技术动态、产品动态
- 🤖 **Joker AI 智能问答**：
  - 选中文字即问即答
  - AI 智能摘要生成
  - 深度分析 / 关联搜索 / 要点总结
  - 多轮对话支持
  - 引用来源追溯
- 📅 **日期导航**：支持按日期查看历史日报
- ✨ **高亮展示**：重点关注事项卡片化展示
- 💡 **业务洞察**：基于情报生成业务建议

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **UI 组件**: Lucide React + Framer Motion

### 后端
- **API**: Next.js API Routes
- **数据库**: PostgreSQL (Supabase)
- **缓存**: Redis (Upstash)
- **AI 服务**: OpenAI API + 阿里云百炼
- **认证**: NextAuth.js

### 部署
- **平台**: Vercel
- **CDN**: Vercel Edge Network

---

## 📁 项目结构

```
ai-infra-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── reports/       # 日报 API
│   │   │   ├── ask-ai/        # Joker AI API
│   │   │   └── auth/          # 认证 API
│   │   ├── page.tsx           # 主页面
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   └── ask-ai/           # Joker AI 组件
│   ├── lib/                  # 工具库
│   │   ├── db/              # 数据库
│   │   ├── cache/           # 缓存
│   │   ├── llm/             # LLM 引擎
│   │   └── services/        # 业务服务
│   └── hooks/               # React Hooks
├── public/                  # 静态资源
├── .env.local              # 环境变量
├── DEPLOYMENT.md           # 部署文档
└── package.json
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/xincxiong/AI-Infra-Hub.git
cd AI-Infra-Hub/ai-infra-hub
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填写配置：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# OpenAI
OPENAI_API_KEY=

# 阿里云百炼
ALIYUN_BAILIAN_API_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📦 部署

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📊 预估成本

| 服务 | 免费额度 | 预估用量 | 费用 |
|------|----------|----------|------|
| Vercel | 100GB | 50GB | $0 |
| Supabase | 500MB | 200MB | $0 |
| Upstash | 10K ops/天 | 5K ops/天 | $0 |
| OpenAI API | - | ~20M tokens | ~$20 |
| **合计** | - | - | **~$20/月** |

---

## 📝 文档

- [部署指南](./DEPLOYMENT.md)
- [产品需求文档](../AI%20市场日报-产品设计文档/产品需求文档.md)
- [技术架构设计](../AI%20市场日报-产品设计文档/技术架构设计-v1.0.md)

---

## 👥 贡献者

- [xincxiong](https://github.com/xincxiong) - 项目负责人

---

## 📄 许可证

MIT License

---

**最后更新**: 2026-04-22
