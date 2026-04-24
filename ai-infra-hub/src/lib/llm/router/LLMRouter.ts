import { LLMClient, Provider } from '../client/LLMClient'

export type TaskType = 'summary' | 'classification' | 'highlight' | 'insight' | 'ask-ai'

interface RouteConfig {
  primary: Provider
  fallback: Provider[]
  rateLimit: number
}

const ROUTING_CONFIG: Record<TaskType, RouteConfig> = {
  summary: { primary: 'aliyun', fallback: [], rateLimit: 100 },
  classification: { primary: 'aliyun', fallback: [], rateLimit: 200 },
  highlight: { primary: 'aliyun', fallback: [], rateLimit: 50 },
  insight: { primary: 'aliyun', fallback: [], rateLimit: 50 },
  'ask-ai': { primary: 'aliyun', fallback: [], rateLimit: 30 },
}

export class LLMRouter {
  private clients: Map<Provider, LLMClient> | null = null
  private failureCount: Map<Provider, number> | null = null
  private rateLimitCount: Map<Provider, number[]> | null = null
  private initialized = false

  private initialize() {
    if (this.initialized) return

    this.clients = new Map()
    this.failureCount = new Map()
    this.rateLimitCount = new Map()

    const providers: Provider[] = ['openai', 'aliyun']
    providers.forEach((provider) => {
      try {
        this.clients!.set(provider, new LLMClient(provider))
        this.failureCount!.set(provider, 0)
        this.rateLimitCount!.set(provider, [])
      } catch (error) {
        console.warn(`Failed to initialize ${provider} client:`, error)
      }
    })

    this.initialized = true
  }

  async getClient(taskType: TaskType): Promise<LLMClient> {
    this.initialize()

    const config = ROUTING_CONFIG[taskType]
    const clients = this.clients!

    if (this.isAvailable(config.primary, config.rateLimit)) {
      return clients.get(config.primary)!
    }

    for (const fallback of config.fallback) {
      if (this.isAvailable(fallback, config.rateLimit)) {
        return clients.get(fallback)!
      }
    }

    return clients.get(config.primary)!
  }

  private isAvailable(provider: Provider, rateLimit: number): boolean {
    const failures = this.failureCount!.get(provider) ?? 0
    if (failures >= 5) {
      return false
    }

    const timestamps = this.rateLimitCount!.get(provider) ?? []
    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000
    const recentCalls = timestamps.filter((t) => t > oneMinuteAgo).length

    if (recentCalls >= rateLimit) {
      return false
    }

    return true
  }

  recordCall(provider: Provider): void {
    const timestamps = this.rateLimitCount!.get(provider) ?? []
    timestamps.push(Date.now())
    this.rateLimitCount!.set(provider, timestamps)
  }

  recordSuccess(provider: Provider): void {
    this.failureCount!.set(provider, 0)
  }

  recordFailure(provider: Provider): void {
    const failures = (this.failureCount!.get(provider) ?? 0) + 1
    this.failureCount!.set(provider, failures)

    if (failures >= 5) {
      console.warn(`Provider ${provider} marked as unhealthy`)
      setTimeout(() => {
        this.failureCount!.set(provider, 0)
      }, 5 * 60 * 1000)
    }
  }

  getStatus(): Record<Provider, { available: boolean; failures: number; recentCalls: number }> {
    this.initialize()
    const status: Record<string, unknown> = {}

    this.clients!.forEach((_, provider) => {
      const failures = this.failureCount!.get(provider) ?? 0
      const timestamps = this.rateLimitCount!.get(provider) ?? []
      const now = Date.now()
      const oneMinuteAgo = now - 60 * 1000
      const recentCalls = timestamps.filter((t) => t > oneMinuteAgo).length

      status[provider] = {
        available: failures < 5 && recentCalls < 100,
        failures,
        recentCalls,
      }
    })

    return status as Record<Provider, { available: boolean; failures: number; recentCalls: number }>
  }
}

export const llmRouter = new LLMRouter()