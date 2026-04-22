# ⚡ 快速开始 - 5 分钟配置自动数据采集

## 📋 配置清单

### 第一步：配置环境变量（2 分钟）

访问 Vercel Dashboard → 选择你的项目 → Settings → Environment Variables

添加以下 3 个环境变量：

#### 1. CRON_SECRET
```
Key: CRON_SECRET
Value: tjASbRVzmc46IQaySLXqdratvPng6ewclf47wFl+DE8=
Environment: Production ✓
```

#### 2. TAVILY_API_KEY
```
Key: TAVILY_API_KEY
Value: （你的 Tavily API Key）
Environment: Production ✓
```

#### 3. NEXTAUTH_SECRET（如果还没有配置）
```bash
# 生成命令
openssl rand -base64 32
```

```
Key: NEXTAUTH_SECRET
Value: （上面生成的值）
Environment: Production ✓
```

**保存后点击 Redeploy 重新部署**

---

### 第二步：手动触发数据采集（1 分钟）

等待 Vercel 部署完成后（约 2-3 分钟），执行以下命令：

#### 选项 A：使用 curl（推荐）

```bash
# 替换为你的 Vercel 域名
YOUR_VERCEL_URL="https://your-app.vercel.app"

# 手动触发数据采集
curl -X POST "${YOUR_VERCEL_URL}/api/cron/daily-report?date=2026-04-22&type=all" \
  -H "Authorization: Bearer tjASbRVzmc46IQaySLXqdratvPng6ewclf47wFl+DE8="
```

**预期响应**:
```json
{
  "success": true,
  "message": "定时任务执行完成",
  "data": {
    "date": "2026-04-22",
    "articlesCollected": 30,
    "reportsGenerated": 3
  }
}
```

#### 选项 B：使用浏览器

安装 REST Client 浏览器扩展，或使用在线工具如 https://hoppscotch.io/

**请求配置**:
- **Method**: POST
- **URL**: `https://your-app.vercel.app/api/cron/daily-report?date=2026-04-22&type=all`
- **Headers**:
  - `Authorization: Bearer tjASbRVzmc46IQaySLXqdratvPng6ewclf47wFl+DE8=`

---

### 第三步：验证数据（1 分钟）

#### 1. 刷新首页

访问你的 Vercel 域名，应该能看到今天的真实数据。

#### 2. 检查 API 响应

```bash
# 获取今天的日报
curl "${YOUR_VERCEL_URL}/api/reports?type=market&date=2026-04-22"
```

#### 3. 查看数据库（可选）

访问 Supabase Dashboard → Table Editor → `raw_articles` 表

```sql
SELECT title, source, quality_score 
FROM raw_articles 
WHERE date = '2026-04-22' 
ORDER BY quality_score DESC 
LIMIT 10;
```

---

### 第四步：验证定时任务（1 分钟）

#### 检查 Vercel Cron Jobs

1. 访问 Vercel Dashboard
2. 选择你的项目
3. 进入 Settings → Cron Jobs
4. 应该能看到配置的定时任务

**执行时间**: 每天早上 8:00

---

## 🎯 完整测试流程

```bash
# 1. 设置变量（替换为你的域名）
export VERCEL_URL="https://your-app.vercel.app"
export CRON_SECRET="tjASbRVzmc46IQaySLXqdratvPng6ewclf47wFl+DE8="
export TODAY=$(date +%Y-%m-%d)

# 2. 触发数据采集
curl -X POST "${VERCEL_URL}/api/cron/daily-report?date=${TODAY}&type=all" \
  -H "Authorization: Bearer ${CRON_SECRET}"

# 3. 等待 30 秒后，获取生成的日报
curl "${VERCEL_URL}/api/reports?type=market&date=${TODAY}" | jq

# 4. 检查文章数量
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
- 重新部署应用

### Q3: 数据采集数量为 0

**可能原因**:
- Tavily API 调用失败
- 网络连接问题
- 日期格式错误

**解决方案**:
```bash
# 检查 API 响应
curl -X POST "${VERCEL_URL}/api/cron/daily-report?date=${TODAY}&type=all" \
  -H "Authorization: Bearer ${CRON_SECRET}" -v
```

### Q4: 页面仍显示模拟数据

**原因**: 数据库中可能没有今天的数据

**解决**:
1. 确认手动触发成功
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

- ✅ 首页显示今天的真实日期（2026-04-22）
- ✅ 有真实的 AI 行业资讯数据
- ✅ 三种类型的日报都已生成
- ✅ 每条数据都有来源链接
- ✅ Joker AI 功能正常工作

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Vercel Function Logs
2. 检查 Supabase 数据库
3. 查看 AUTO_CRAWLER_SETUP.md 详细文档

**祝你使用愉快！** 🚀
