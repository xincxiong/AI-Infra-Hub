# 🤖 自动数据采集配置指南

## 📋 概述

AI-Infra-Hub 已配置自动数据采集和日报生成系统，每天自动执行。

---

## ⏰ 定时任务配置

### Vercel Cron Job

**执行时间**: 每日早上 8:00 (UTC)，北京时间下午 4:00  
**Cron 表达式**: `0 8 * * *`  
**执行内容**:
1. 搜索 5 组 AI 行业关键词
2. 用 Tavily API 采集资讯（降级到阿里云百炼）
3. 数据去重并保存到 Supabase
4. 生成三种类型的日报（市场动态、技术动态、产品动态）

---

## 🔧 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 中配置以下变量：

### 1. CRON_SECRET（定时任务密钥）

用于保护 `/api/cron/daily-report` 端点，防止未授权访问。

```bash
openssl rand -base64 32
```

### 2. 数据采集服务配置

**Tavily API**（推荐，更准确）:
```
Key: TAVILY_API_KEY
Value: （从 https://app.tavily.com/ 获取）
```

**阿里云百炼**（备选 LLM 搜索）:
```
Key: ALIYUN_BAILIAN_API_KEY
Value: （从阿里云百炼控制台获取）
```

---

## 🚀 手动触发数据采集

### 使用 curl（推荐）

```bash
# 获取今天的日期
TODAY=$(date +%Y-%m-%d)

# 手动触发数据采集和日报生成
curl -X POST "https://your-app.vercel.app/api/cron/daily-report?date=$TODAY&type=all" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**参数说明**:
- `date`: 日期（格式：YYYY-MM-DD），默认为今天
- `type`: 日报类型（market | tech | product | all），默认为 all

**响应示例**:
```json
{
  "success": true,
  "message": "定时任务执行完成",
  "data": {
    "date": "2026-04-25",
    "articlesCollected": 30,
    "reportsGenerated": 3
  }
}
```

---

## 📊 数据采集流程

### 1. 自动采集（定时任务）

1. **搜索关键词**（5 个查询）:
   - AI artificial intelligence (Technology)
   - AI startup funding investment (Business)
   - AI product launch release (Product)
   - machine learning research paper (Research)
   - GPU chip hardware NVIDIA (Hardware)

2. **每个查询采集 10 篇文章**
   - 优先使用 Tavily API
   - 降级到阿里云百炼

3. **保存到数据库**
   - URL 去重
   - 自动计算质量分数
   - 智能标签分类
   - 事件类型检测

4. **生成三种日报**
   - 市场动态日报
   - 技术动态日报
   - 产品动态日报

---

## 🔍 验证数据采集

### 检查数据库

```sql
-- 查看当日文章
SELECT * FROM raw_articles 
WHERE date = CURRENT_DATE 
ORDER BY quality_score DESC;

-- 查看已发布日报
SELECT * FROM daily_reports 
WHERE report_date = CURRENT_DATE 
AND status = 'published';
```

### 测试 API

```bash
curl "https://your-app.vercel.app/api/reports?type=market&date=2026-04-25"
```

---

## ⚙️ 自定义配置

### 修改采集时间

编辑 `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-report?type=all",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 修改采集关键词

编辑 `src/app/api/cron/daily-report/route.ts`:
```typescript
const searchQueries = [
  { query: '你的关键词', segment: 'Technology' },
]
```

### 修改采集数量

```typescript
const results = await crawlerService.smartSearch({
  query,
  segment,
  date,
  maxResults: 20, // 修改此值
})
```

---

## 🐛 故障排查

### 问题 1: 日报未生成

**检查步骤**:
1. 确认数据库中有当天的文章 (`raw_articles`)
2. 检查 `daily_reports` 表是否有记录
3. 查看 Vercel Function Logs

### 问题 2: 数据采集失败

**可能原因**:
- API Key 未配置或过期
- Tavily API 调用次数超限（免费 1000 次/月）

**解决方案**:
1. 检查环境变量是否正确配置
2. 查看 Vercel Functions 执行日志

---

## 💰 成本预估

| 服务 | 免费额度 | 预估用量 | 费用 |
|------|----------|----------|------|
| Tavily API | 1000 次/月 | 30 次/天 × 30 = 900 次 | $0 |
| Vercel Cron | 免费 | 1 次/天 | $0 |
| Supabase | 500MB | ~50MB/月 | $0 |
| 阿里云百炼 | 按量 | ~¥3/天（日报生成） | ~¥100/月 |
| **合计** | - | - | **~¥100/月** |

---

## 📝 快速开始清单

- [ ] 配置 `CRON_SECRET` 环境变量
- [ ] 配置 `TAVILY_API_KEY` 环境变量
- [ ] 配置 `ALIYUN_BAILIAN_API_KEY` 环境变量
- [ ] 推送代码到 GitHub 触发部署
- [ ] 手动触发一次数据采集
- [ ] 验证数据入库和日报生成

---

**最后更新**: 2026-04-25  
**文档版本**: v1.1
