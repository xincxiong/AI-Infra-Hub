# AI Infra Hub - Agent Instructions

## Build & Verify
- `npm run dev` — start dev server on port 3000
- `npm run build` — production build (must succeed, 0 errors)
- `npm run lint` — ESLint (2 pre-existing react-hooks/exhaustive-deps warnings in page.tsx:85, AskAISidebar.tsx:53)
- `npx tsc --noEmit` — type check (must be 0 errors)
- **Critical**: `.env.local` must exist with all env vars for `npm run build` to succeed. Proxy pattern in `src/lib/db/supabase.ts` and `src/lib/cache/redis.ts` uses `SupabaseClient`/`Redis` typed Proxies — no `as any` casts in service code.

## Architecture
- **Framework**: Next.js 14 App Router, single package (not monorepo)
- **Frontend**: `src/app/page.tsx` (main dashboard, 3 report types), `src/components/ask-ai/` (Joker AI sidebar, text selection toolbar)
- **Backend**: 6 API routes in `src/app/api/`: reports, ask-ai, cron/daily-report, credits, users/stats, auth/[...nextauth]
- **Services**: `src/lib/services/` — ReportService, AskAIService, CrawlerService
- **Infra**: `src/lib/db/supabase.ts` (PostgreSQL), `src/lib/cache/redis.ts` (Upstash), `src/lib/llm/` (LLM routing: aliyun primary, openai fallback)
- **Auth**: `src/lib/auth.ts` — NextAuth.js with Google + GitHub OAuth only (credentials provider removed)
- **Entry points**: `src/app/layout.tsx` → `src/app/page.tsx`

## Key Conventions
- **Lazy loading**: `auth.ts` uses `await import('./db/supabase')` inside `signIn` callback to avoid build-time Supabase client creation. Never add top-level `import { supabaseAdmin }` in any file imported by auth routes.
- **Database schema**: `src/lib/db/schema.sql` — run in Supabase SQL Editor for production setup. Tables: users, daily_reports, raw_articles, ask_ai_sessions, user_favorites, search_keywords, search_cost_monitoring.
- **Cron**: `vercel.json` schedules `/api/cron/daily-report?type=all` daily at 08:00 UTC. CRON_SECRET env var required for production Authorization header check.

## Common Pitfalls
- **Build crashes**: If `supabaseUrl is required` error during build, check that no file imports `supabaseAdmin` from `src/lib/db/supabase` at module level. Use `await import()` for lazy loading.
- **Type casting**: `supabaseAdmin` and `redis` are Proxy objects. For new service code, cast as `as any` with `eslint-disable-next-line` or use the Proxy directly with `(supabaseClient as never)[prop]` pattern.
- **Mock data**: `page.tsx` falls back to mock report data on API failure (acceptable for MVP). Real data requires Supabase + cron jobs.

## Pre-deployment Checklist
- [ ] Configure 7+ env vars in Vercel (SUPabase, Redis, NextAuth, ALIYUN_BAILIAN_API_KEY) — see `.env.local.example`
- [ ] Run `src/lib/db/schema.sql` in Supabase SQL Editor
- [ ] Verify `vercel.json` cron schedule is `0 8 * * *` (not `*/1`)
- [ ] Test: `curl -X POST https://<domain>/api/cron/daily-report?type=all -H "Authorization: Bearer $CRON_SECRET"`
