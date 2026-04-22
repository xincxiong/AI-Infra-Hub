# 🤖 自动数据采集配置指南

## 📋 概述

AI-Infra-Hub 已配置自动数据采集和日报生成系统，每天自动执行。

---

## ⏰ 定时任务配置

### Vercel Cron Job

**执行时间**: 每天早上 8:00 (UTC+8)  
**执行内容**: 
1. 采集 AI 行业资讯
2. 保存到数据库
3. 生成三种类型的日报（市场动态、技术动态、产品动态）

**Cron 表达式**: `0 8 * * *`

---

## 🔧 环境变量配置

### 必需的环境变量

在 Vercel Dashboard → Settings → Environment Variables 中配置以下变量：

#### 1. CRON_SECRET（定时任务密钥）

用于保护 `/api/cron/daily-report` 端点，防止未授权访问。

**生成方法**:
```bash
openssl rand -base64 32
```

**配置**:
```
Key: CRON_SECRET
Value: （上面生成的密钥）
Environment: Production ✓
```

#### 2. 数据采集服务配置

**Tavily API**（推荐，更准确）:
```
Key: TAVILY_API_KEY
Value: （从 https://app.tavily.com/ 获取）
Environment: Production ✓
```

**阿里云百炼**（备选）:
```
Key: ALIYUN_BAILIAN_API_KEY
Value: （从阿里云百炼控制台获取）
Environment: Production ✓
```

---

## 🚀 手动触发数据采集

### 方式 1：使用 curl 命令（推荐）

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

**示例**:
```bash
# 采集今天的所有类型数据
curl -X POST "https://your-app.vercel.app/api/cron/daily-report?date=2026-04-22&type=all" \
  -H "Authorization: Bearer your-cron-secret-here"

# 只采集市场动态
curl -X POST "https://your-app.vercel.app/api/cron/daily-report?date=2026-04-22&type=market" \
  -H "Authorization: Bearer your-cron-secret-here"
```

### 方式 2：使用 Postman 或 Insomnia

**请求配置**:
- **Method**: POST
- **URL**: `https://your-app.vercel.app/api/cron/daily-report?date=2026-04-22&type=all`
- **Headers**:
  - `Authorization: Bearer YOUR_CRON_SECRET`
  - `Content-Type: application/json`

**响应示例**:
```json
{
  "success": true,
  "message": "定时任务执行完成",
  "data": {
    "date": "2026-04-22",
    "articlesCollected": 45,
    "reportsGenerated": 3
  }
}
```

### 方式 3：在 Vercel Functions 中测试

访问：`https://your-app.vercel.app/api/cron/daily-report` (GET 请求)

这将返回 Cron Job 的配置信息。

---

## 📊 数据采集流程

### 1. 自动采集（定时任务）

**时间**: 每天早上 8:00  
**执行步骤**:

1. **搜索关键词**（5 个查询）:
   - AI artificial intelligence (Technology)
   - AI startup funding investment (Business)
   - AI product launch release (Product)
   - machine learning research paper (Research)
   - GPU chip hardware NVIDIA (Hardware)

2. **每个查询采集 10 篇文章**
   - 使用 Tavily API 进行搜索
   - 自动提取标题、摘要、来源等信息

3. **保存到数据库**
   - 去重检查（基于 URL）
   - 计算质量分数
   - 自动标签分类

4. **生成三种日报**
   - 市场动态日报
   - 技术动态日报
   - 产品动态日报

### 2. 手动采集（按需触发）

当你需要补充数据或测试时，可以手动触发。

---

## 🔍 验证数据采集

### 检查数据库

使用 Supabase Dashboard 查看采集结果：

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 Table Editor

**查看原始文章**:
```sql
SELECT * FROM raw_articles 
WHERE date = '2026-04-22' 
ORDER BY quality_score DESC;
```

**查看生成的日报**:
```sql
SELECT * FROM daily_reports 
WHERE report_date = '2026-04-22' 
AND status = 'published';
```

### 检查 API 响应

访问首页 API 测试：
```bash
curl "https://your-app.vercel.app/api/reports?type=market&date=2026-04-22"
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
      "schedule": "0 9 * * *"
    }
  ]
}
```

**常用 Cron 表达式**:
- `0 8 * * *` - 每天早上 8 点
- `0 9 * * *` - 每天早上 9 点
- `0 12 * * *` - 每天中午 12 点
- `0 0 * * *` - 每天凌晨 0 点

### 修改采集关键词

编辑 `src/app/api/cron/daily-report/route.ts`:
```typescript
const searchQueries = [
  { query: '你的关键词', segment: '类别' },
  // 添加更多查询
]
```

### 修改采集数量

```typescript
const results = await crawlerService.smartSearch({
  query,
  segment,
  date,
  maxResults: 20,  // 修改这里，默认 10
})
```

---

## 🐛 故障排查

### 问题 1: Cron Job 未执行

**检查步骤**:
1. 确认 `vercel.json` 已推送到 GitHub
2. 在 Vercel Dashboard → Settings → Cron Jobs 查看状态
3. 检查部署日志确认配置生效

### 问题 2: 数据采集失败

**可能原因**:
- API Key 未配置或过期
- 网络连接问题
- 目标网站反爬虫

**解决方案**:
1. 检查环境变量是否配置
2. 查看 Vercel Functions 日志
3. 尝试使用备用 API（阿里云百炼）

### 问题 3: 日报未生成

**检查步骤**:
1. 确认数据库中有当天的文章
2. 检查 `daily_reports` 表是否有记录
3. 查看 API 错误日志

---

## 📈 监控和维护

### 监控指标

- **每日采集文章数**: 目标 30-50 篇
- **日报生成成功率**: 目标 100%
- **数据质量分数**: 目标 >70 分

### 日志查看

在 Vercel Dashboard → Deployments → 选择部署 → Function Logs 查看执行日志。

### 定期维护

- **每周**: 检查数据质量
- **每月**: 更新采集关键词
- **每季度**: 审查 API 使用情况

---

## 💰 成本预估

| 服务 | 免费额度 | 预估用量 | 费用 |
|------|----------|----------|------|
| Tavily API | 1000 次/月 | 30 次/天 × 30 = 900 次 | $0 |
| Vercel Cron | 包含 | 1 次/天 | $0 |
| Supabase | 500MB | ~50MB/月 | $0 |
| **合计** | - | - | **$0** |

---

## 📝 快速开始清单

- [ ] 配置 `CRON_SECRET` 环境变量
- [ ] 配置 `TAVILY_API_KEY` 环境变量
- [ ] 推送 `vercel.json` 到 GitHub
- [ ] 手动触发一次数据采集（使用 curl）
- [ ] 验证数据库中是否有数据
- [ ] 访问首页检查显示
- [ ] 设置日历提醒检查第一周运行状况

---

**最后更新**: 2026-04-22  
**文档版本**: v1.0
