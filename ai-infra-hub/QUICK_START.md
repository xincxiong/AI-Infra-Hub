# ⚡ 快速开始 - 5 分钟配置自动数据采集

## 📋 配置清单

### 第一步：在 Vercel 配置环境变量

访问 Vercel Dashboard → 选择你的项目 → Settings → Environment Variables

添加以下 3 个关键环境变量：

#### 1. CRON_SECRET
```
Key: CRON_SECRET
Value: （运行 openssl rand -base64 32 生成）
Environment: Production ✓
```

#### 2. TAVILY_API_KEY
```
Key: TAVILY_API_KEY
Value: （从 https://app.tavily.com/ 获取）
Environment: Production ✓
```

#### 3. NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

```
Key: NEXTAUTH_SECRET
Value: （上面生成的值）
Environment: Production ✓
```

**保存后 Vercel 会自动重新部署**

---

### 第二步：手动触发数据采集

等待部署完成后（约 2-3 分钟），执行：

```bash
# 替换为你的 Vercel 域名
YOUR_VERCEL_URL="https://your-app.vercel.app"
CRON_SECRET="your-cron-secret"
TODAY=$(date +%Y-%m-%d)

# 手动触发数据采集
curl -X POST "${YOUR_VERCEL_URL}/api/cron/daily-report?date=${TODAY}&type=all" \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

**预期响应**:
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

### 第三步：验证数据

#### 1. 刷新首页

访问你的 Vercel 域名 → 应该能看到今天的真实数据。

#### 2. 检查 API 响应

```bash
curl "${YOUR_VERCEL_URL}/api/reports?type=market&date=${TODAY}"
```

#### 3. 查看数据库

访问 Supabase Dashboard → Table Editor → `raw_articles` 表

```sql
SELECT title, source, quality_score 
FROM raw_articles 
WHERE date = CURRENT_DATE 
ORDER BY quality_score DESC 
LIMIT 10;
```

---

### 第四步：验证定时任务

Vercel Dashboard → Settings → Cron Jobs → 确认定时任务已启用

**执行时间**: 每天早上 8:00 (UTC)

---

## 🎯 完整测试流程

```bash
# 1. 设置变量
export VERCEL_URL="https://your-app.vercel.app"
export CRON_SECRET="your-cron-secret"
export TODAY=$(date +%Y-%m-%d)

# 2. 触发数据采集
curl -X POST "${VERCEL_URL}/api/cron/daily-report?date=${TODAY}&type=all" \
  -H "Authorization: Bearer ${CRON_SECRET}"

# 3. 获取生成的日报
curl "${VERCEL_URL}/api/reports?type=market&date=${TODAY}" | jq

# 4. 检查各分类文章数量
curl "${VERCEL_URL}/api/reports?type=market&date=${TODAY}" | jq '.sections[].items | length'
```

---

## ⚠️ 常见问题

### Q1: 401 Unauthorized

**原因**: CRON_SECRET 不匹配

**解决**: 
- 确认环境变量已正确配置
- 确认 Bearer Token 格式正确
- 重新部署应用

### Q2: Tavily API Key 无效

**原因**: API Key 未配置或过期

**解决**:
- 访问 https://app.tavily.com/ 检查密钥状态
- 确认环境变量 `TAVILY_API_KEY` 已配置

### Q3: 页面仍显示模拟数据

**原因**: 数据库中可能没有当天数据

**解决**:
1. 确认手动触发成功（查看 Vercel Function Logs）
2. 检查 Supabase 数据库
3. 清除浏览器缓存

---

## 📊 预期时间线

| 步骤 | 时间 | 状态 |
|------|------|------|
| 配置环境变量 | 2 分钟 | ⏳ 待完成 |
| Vercel 重新部署 | 2-3 分钟 | ⏳ 待完成 |
| 手动触发采集 | 1 分钟 | ⏳ 待完成 |
| 数据采集执行 | 30-60 秒 | ⏳ 待完成 |
| 生成三种日报 | 1-2 分钟 | ⏳ 待完成 |
| **总计** | **~7 分钟** | ⏳ |

---

## 🎉 成功标志

完成后，你应该能看到：

- ✅ 首页显示今天的真实日期
- ✅ 有真实的 AI 行业资讯数据
- ✅ 三种类型的日报都已生成
- ✅ 每条数据都有来源链接
- ✅ Joker AI 功能正常工作

---

**祝你使用愉快！** 🚀
