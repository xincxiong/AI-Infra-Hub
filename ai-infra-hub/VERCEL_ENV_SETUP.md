# Vercel 环境变量配置指南

本文档说明如何在 Vercel 中配置必需的环境变量。

## 必需的环境变量

以下是部署 AI-Infra-Hub 项目必须配置的环境变量：

### 1. Supabase 配置

**获取方式：**
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下值

**需要配置的变量：**

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production ✓
```

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（完整的 anon public key）
Environment: Production ✓
```

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（完整的 service role key）
Environment: Production ✓
```

⚠️ **重要提示：** 
- `NEXT_PUBLIC_` 前缀的变量会在浏览器端使用
- `SUPABASE_SERVICE_ROLE_KEY` 是敏感密钥，只能在服务端使用

---

### 2. Upstash Redis 配置

**获取方式：**
1. 访问 [Upstash Console](https://console.upstash.io/)
2. 选择你的 Redis 实例
3. 复制 REST API 信息

**需要配置的变量：**

```
Key: UPSTASH_REDIS_REST_URL
Value: https://xxx-xxx.upstash.io
Environment: Production ✓
```

```
Key: UPSTASH_REDIS_REST_TOKEN
Value: xxx...（完整的 token）
Environment: Production ✓
```

---

### 3. NextAuth 配置

**生成 NEXTAUTH_SECRET：**

在终端运行以下命令生成安全的密钥：
```bash
openssl rand -base64 32
```

**需要配置的变量：**

```
Key: NEXTAUTH_SECRET
Value: （上面生成的密钥，例如：7V8K6NvnaJQsZc4AqNEUZjsqPA+2iJMliqoTSuEN9Hk=）
Environment: Production ✓
```

```
Key: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
Environment: Production ✓
```

⚠️ **重要提示：**
- `NEXTAUTH_URL` 应该是你的 Vercel 生产域名
- 可以在 Vercel Dashboard → Project Settings → Domains 查看

---

## 配置步骤

### 方式 1：通过 Vercel Dashboard（推荐）

1. **访问 Vercel Dashboard**
   - 打开 https://vercel.com/dashboard

2. **选择项目**
   - 找到并点击 **AI-Infra-Hub** 项目

3. **进入设置**
   - 点击顶部导航栏的 **Settings**
   - 选择左侧菜单的 **Environment Variables**

4. **添加环境变量**
   - 点击 **Add Environment Variable** 按钮
   - 按照上面的列表逐个添加 7 个变量
   - 每个变量都要选择 **Production** 环境 ✓

5. **保存并重新部署**
   - 添加完所有变量后，点击 **Redeploy** 按钮
   - 或者在 **Deployments** 页面手动触发新的部署

### 方式 2：使用 Vercel CLI

如果你已安装 Vercel CLI，可以在本地执行：

```bash
# 登录 Vercel
vercel login

# 进入项目目录
cd ai-infra-hub

# 拉取环境变量（可选）
vercel env pull

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 重新部署
vercel --prod
```

---

## 验证配置

### 1. 检查环境变量是否存在

在 Vercel Dashboard 中：
- Settings → Environment Variables
- 确认所有 7 个变量都已添加
- 确认所有变量都勾选了 **Production**

### 2. 查看部署日志

重新部署后，检查日志：
- 不应该出现 `supabaseKey is required` 错误
- 不应该出现 `UPSTASH_REDIS_REST_URL` 相关错误
- 应该看到 `✓ Compiled successfully`

### 3. 测试应用

部署成功后：
1. 访问你的 Vercel 域名（例如：https://your-app.vercel.app）
2. 页面应该正常显示
3. 测试 API 端点：
   - https://your-app.vercel.app/api/reports?type=market&date=2026-04-22
   - https://your-app.vercel.app/api/credits

---

## 常见问题

### Q1: 部署成功但页面显示空白

**可能原因：** 浏览器端环境变量未生效

**解决方案：**
1. 检查 `NEXT_PUBLIC_` 前缀是否正确
2. 清除浏览器缓存
3. 查看浏览器控制台的错误信息

### Q2: API 返回 500 错误

**可能原因：** 服务端环境变量配置错误

**解决方案：**
1. 检查 Supabase 密钥是否正确
2. 检查 Upstash Redis 配置
3. 查看 Vercel Functions 日志

### Q3: 本地开发如何配置？

**解决方案：**
在项目根目录创建 `.env.local` 文件：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

⚠️ **注意：** `.env.local` 不应该提交到 Git（已在 .gitignore 中）

---

## 安全建议

1. **定期轮换密钥**
   - 建议每 3-6 个月更换一次密钥
   - 在 Supabase 和 Upstash 后台重新生成密钥

2. **使用不同的密钥**
   - 开发环境和生产环境使用不同的密钥
   - 避免在生产环境使用测试密钥

3. **保护敏感信息**
   - 不要将 `.env.local` 提交到 Git
   - 不要在公开场合分享密钥

---

## 参考链接

- [Vercel 环境变量文档](https://vercel.com/docs/environment-variables)
- [Supabase API 文档](https://supabase.com/docs/reference/javascript/introduction)
- [Upstash Redis 文档](https://upstash.com/docs/redis/overall/gettingstarted)
- [NextAuth.js 文档](https://next-auth.js.org/configuration/options#environment-variables)

---

## 需要帮助？

如果遇到问题：
1. 检查 Vercel 部署日志
2. 查看 Supabase 和 Upstash 控制台
3. 确认所有环境变量都已正确配置

**部署检查清单：**
- [ ] NEXT_PUBLIC_SUPABASE_URL ✓
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY ✓
- [ ] SUPABASE_SERVICE_ROLE_KEY ✓
- [ ] UPSTASH_REDIS_REST_URL ✓
- [ ] UPSTASH_REDIS_REST_TOKEN ✓
- [ ] NEXTAUTH_SECRET ✓
- [ ] NEXTAUTH_URL ✓
- [ ] 已重新部署 ✓
