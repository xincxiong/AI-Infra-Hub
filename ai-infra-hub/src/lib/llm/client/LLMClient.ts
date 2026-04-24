import OpenAI from 'openai'

export type Provider = 'openai' | 'aliyun' | 'deepseek'

interface LLMConfig {
  apiKey: string
  baseURL: string
  defaultModel: string
}

const LLM_CONFIGS: Record<Provider, LLMConfig> = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
  aliyun: {
    apiKey: process.env.ALIYUN_BAILIAN_API_KEY!,
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    defaultModel: 'glm-5',
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
  },
}

export interface GenerateOptions {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export class LLMClient {
  private client: OpenAI | null = null
  private provider: Provider
  private model: string
  private config: LLMConfig

  constructor(provider: Provider = 'aliyun') {
    this.provider = provider
    this.config = LLM_CONFIGS[provider]
    this.model = this.config.defaultModel
  }

  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.config.apiKey) {
        throw new Error(`Missing API key for provider: ${this.provider}`)
      }
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
      })
    }
    return this.client
  }

  async generate(options: GenerateOptions): Promise<string> {
    const response = await this.getClient().chat.completions.create({
      model: this.model,
      messages: [
        ...(options.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []),
        { role: 'user' as const, content: options.prompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    })

    return response.choices[0]?.message?.content ?? ''
  }

  async *generateStream(options: { prompt: string; systemPrompt?: string; temperature?: number }): AsyncGenerator<string> {
    const stream = await this.getClient().chat.completions.create({
      model: this.model,
      messages: [
        ...(options.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []),
        { role: 'user' as const, content: options.prompt },
      ],
      temperature: options.temperature ?? 0.7,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? ''
      if (content) yield content
    }
  }

  setModel(model: string): void {
    this.model = model
  }

  getProvider(): Provider {
    return this.provider
  }
}

export const createLLMClient = (provider?: Provider): LLMClient => {
  return new LLMClient(provider ?? (process.env.LLM_PROVIDER as Provider) ?? 'aliyun')
}