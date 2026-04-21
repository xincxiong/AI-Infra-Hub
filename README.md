# AI Infra Hub

> AI 基础设施行业情报日报平台

## 项目简介

AI Infra Hub 是一个面向 AI 从业者、投资人和企业决策者的专业日报平台，每日汇总技术、市场、产品三个维度的 AI 行业动态。

### 核心功能

- 📊 **三种日报类型**：市场动态、技术动态、产品动态
- 🤖 **Joker AI 智能问答**：选中文字即问即答，AI 智能摘要，深度分析，多轮对话
- 📅 **日期导航**：支持按日期查看历史日报
- ✨ **高亮展示**：重点事项卡片化展示

## 技术栈

- **前端**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **后端**: Next.js API Routes + PostgreSQL (Supabase) + Redis (Upstash)
- **AI**: OpenAI + 阿里云百炼（多模型路由）
- **部署**: Vercel

## 项目结构

```
ai-infra-hub/              # 主项目
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API 路由
│   │   └── page.tsx      # 主页面
│   ├── components/       # React 组件
│   └── lib/               # 核心库（LLM、数据库、缓存、服务）
├── DEPLOYMENT.md          # 部署指南
└── package.json

mvp-demo/                  # 早期原型（参考）
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/xincxiong/AI-Infra-Hub.git
cd AI-Infra-Hub/ai-infra-hub

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 填写 Supabase、Upstash、OpenAI 等配置

# 启动开发服务器
npm run dev
```

## 部署

详细部署指南请参考 [DEPLOYMENT.md](./ai-infra-hub/DEPLOYMENT.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 预估成本

| 服务 | 免费额度 | 预估费用 |
|------|----------|----------|
| Vercel | 100GB | $0 |
| Supabase | 500MB | $0 |
| Upstash | 10K ops/天 | $0 |
| OpenAI API | - | ~$20/月 |

## 贡献者

[xincxiong](https://github.com/xincxiong) - 项目负责人

## 许可证

MIT License

**最后更新**: 2026-04-22
