import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL!
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!

// Redis 客户端实例
export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
})

// 缓存键前缀
export const CACHE_KEYS = {
  // 日报缓存 (1 小时)
  REPORT: (date: string, type: string) => `report:${type}:${date}`,
  REPORT_LIST: (type: string, page: number) => `report:list:${type}:${page}`,
  
  // 内容缓存 (30 分钟)
  NEWS_ITEM: (id: string) => `news:${id}`,
  NEWS_LIST: (category: string, date: string) => `news:list:${category}:${date}`,
  
  // 用户缓存 (1 天)
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_FAVORITES: (userId: string) => `user:${userId}:favorites`,
  
  // 配置缓存 (1 小时)
  DATA_SOURCES: 'config:data_sources',
  SEARCH_KEYWORDS: 'config:search_keywords',
  
  // 速率限制
  RATE_LIMIT: (userId: string, endpoint: string) => `rate:${userId}:${endpoint}`,
  
  // ASK AI 额度 (当天)
  ASK_AI_CREDITS: (userId: string, date: string) => `credits:${userId}:${date}`,
  
  // ASK AI 会话 (7 天)
  ASK_SESSION: (sessionId: string) => `ask:session:${sessionId}`,
}

// 缓存过期时间（秒）
export const CACHE_TTL = {
  REPORT: 3600,           // 1 小时
  NEWS_ITEM: 1800,        // 30 分钟
  USER_PROFILE: 86400,    // 1 天
  CONFIG: 3600,           // 1 小时
  RATE_LIMIT: 60,         // 1 分钟
  ASK_AI_CREDITS: 86400,  // 1 天（当天有效）
  ASK_SESSION: 604800,    // 7 天
}

// 缓存管理类
export class CacheManager {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      if (!data) return null
      return data as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // 设置缓存
  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, value)
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }

  // 批量删除（支持通配符）
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache delPattern error:', error)
    }
  }

  // 主动失效日报缓存
  async invalidateReport(date: string, type: string): Promise<void> {
    const keys = [
      CACHE_KEYS.REPORT(date, type),
      CACHE_KEYS.REPORT_LIST(type, 1),
    ]
    await Promise.all(keys.map(key => this.del(key)))
  }

  // 缓存预热
  async warmupReport(date: string, type: string, data: any): Promise<void> {
    const key = CACHE_KEYS.REPORT(date, type)
    await this.set(key, data, CACHE_TTL.REPORT)
  }

  // 检查速率限制
  async checkRateLimit(userId: string, endpoint: string, limit: number): Promise<boolean> {
    const key = CACHE_KEYS.RATE_LIMIT(userId, endpoint)
    const current = await this.redis.incr(key)
    
    if (current === 1) {
      // 第一次请求，设置过期时间
      await this.redis.expire(key, CACHE_TTL.RATE_LIMIT)
    }
    
    return current <= limit
  }

  // 获取 ASK AI 剩余额度
  async getAskAICredits(userId: string): Promise<{ remaining: number; used: number }> {
    const today = new Date().toISOString().slice(0, 10)
    const key = CACHE_KEYS.ASK_AI_CREDITS(userId, today)
    
    const used = await this.redis.get<number>(key) || 0
    const MAX_CREDITS = 100
    
    return {
      remaining: Math.max(0, MAX_CREDITS - used),
      used,
    }
  }

  // 扣除 ASK AI 额度
  async deductAskAICredit(userId: string): Promise<number> {
    const today = new Date().toISOString().slice(0, 10)
    const key = CACHE_KEYS.ASK_AI_CREDITS(userId, today)
    
    const current = await this.redis.incr(key)
    
    if (current === 1) {
      // 第一次使用，设置当天过期
      const tomorrow = new Date()
      tomorrow.setHours(24, 0, 0, 0)
      const ttl = Math.floor((tomorrow.getTime() - Date.now()) / 1000)
      await this.redis.expire(key, ttl)
    }
    
    const MAX_CREDITS = 100
    return Math.max(0, MAX_CREDITS - current)
  }
}

// 导出单例
export const cacheManager = new CacheManager()