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
- **UI 组件**: Lucide React + Framer Motion

### 后端
- **API**: Next.js API Routes（6 个端点）
- **数据库**: PostgreSQL (Supabase)
- **缓存**: Redis (Upstash)
- **AI 服务**: 阿里云百炼（主）+ OpenAI（备选）
- **认证**: NextAuth.js（Google + GitHub OAuth）
- **数据采集**: Tavily API + 阿里云百炼

### 部署
- **平台**: Vercel（含 Cron 定时任务）
- **CI/CD**: GitHub Actions（自动构建 + 测试）

---

## 📁 项目结构

```
ai-infra-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由（6 个端点）
│   │   │   ├── reports/       # 日报 API
│   │   │   ├── ask-ai/        # Joker AI API
│   │   │   ├── credits/       # 额度 API
│   │   │   ├── users/stats/   # 用户统计 API
│   │   │   ├── cron/          # 定时任务 API
│   │   │   └── auth/          # NextAuth 认证 API
│   │   ├── auth/              # 登录/登出/错误页面
│   │   ├── page.tsx           # 主页面
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   └── ask-ai/           # Joker AI 组件
│   ├── lib/                  # 工具库
│   │   ├── db/              # Supabase 客户端
│   │   ├── cache/           # Redis 缓存
│   │   ├── llm/             # LLM 引擎（含路由）
│   │   ├── services/        # 业务服务（3 个）
│   │   └── logger.ts        # 日志工具
│   └── tests/               # 单元测试（28 个）
├── .github/workflows/       # CI/CD 配置
├── AGENTS.md                # AI 代理指令
├── DEPLOYMENT.md            # 部署指南
├── vitest.config.ts         # 测试配置
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

# 阿里云百炼（主 AI 服务）
ALIYUN_BAILIAN_API_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

### 4. 运行测试

```bash
npm run test
# 预期: 28 tests passing
```

### 5. 启动开发服务器

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
| 阿里云百炼 | - | ~20M tokens | ~¥100 |
| Tavily | 1000 次/月 | 500 次/月 | $0 |
| **合计** | - | - | **~¥100/月** |

---

## 📝 文档

- [部署指南](./DEPLOYMENT.md)
- [自动采集配置](./AUTO_CRAWLER_SETUP.md)
- [快速开始](./QUICK_START.md)
- [AI 代理指令](./AGENTS.md)

---

## 👥 贡献者

- [xincxiong](https://github.com/xincxiong) - 项目负责人

---

## 📄 许可证

MIT License

---

**最后更新**: 2026-04-25
