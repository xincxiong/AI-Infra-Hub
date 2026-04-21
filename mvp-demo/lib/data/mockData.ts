// 模拟日报数据
export interface Highlight {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  tag?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  impact: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export interface ReportSection {
  id: string;
  name: string;
  items: NewsItem[];
}

export interface DailyReport {
  id: string;
  type: 'market' | 'tech' | 'product';
  reportDate: string;
  title: string;
  summary: string;
  highlights: Highlight[];
  insights: Insight[];
  sections: ReportSection[];
  publishedAt: string;
}

// 市场动态版日报数据
export const marketReport: DailyReport = {
  id: 'market-2026-04-12',
  type: 'market',
  reportDate: '2026-04-12',
  title: 'AI 市场日报 - 2026年4月12日',
  summary: '今日 AI 市场动态聚焦：大模型竞争加剧，GPU 供应链持续紧张，AI Agent 产品化加速推进。',
  publishedAt: '2026-04-12T08:00:00Z',
  highlights: [
    {
      id: '1',
      title: 'OpenAI 发布 GPT-5 Beta 版，推理能力提升 40%',
      summary: 'GPT-5 Beta 面向企业用户开放，支持 1M token 上下文，企业版定价 $0.03/1K tokens。首批合作伙伴包括微软、Salesforce 等。',
      source: 'OpenAI 官方博客',
      url: 'https://openai.com/blog/gpt-5-beta',
      publishedAt: '2026-04-12T06:30:00Z',
      tag: '产品发布'
    },
    {
      id: '2',
      title: 'NVIDIA B200 GPU 产能紧张，交付周期延长至 32 周',
      summary: '受 TSMC CoWoS 封装产能限制，NVIDIA B200 交付周期从 26 周延长至 32 周。阿里云、腾讯云等云厂商已提前预订 Q3 产能。',
      source: 'NVIDIA 投资者关系',
      url: 'https://investor.nvidia.com',
      publishedAt: '2026-04-12T07:15:00Z',
      tag: '供应链'
    },
    {
      id: '3',
      title: 'Anthropic 融资 15 亿美元，估值达 400 亿美元',
      summary: '本轮由 Google 领投，Sales Ventures、Spark Capital 跟投。资金将用于 Claude 模型研发和企业版 Claude Pro 扩展。',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/anthropic-funding',
      publishedAt: '2026-04-12T05:45:00Z',
      tag: '融资'
    },
    {
      id: '4',
      title: 'Meta 发布 AI Agent 平台 AgentGPT，支持自定义工作流',
      summary: 'AgentGPT 允许企业构建多 Agent 协作系统，集成 LLaMA 4 模型，支持 API 调用和外部工具连接。企业版定价 $99/月。',
      source: 'Meta AI 博客',
      url: 'https://ai.meta.com/agentgpt',
      publishedAt: '2026-04-12T04:20:00Z',
      tag: '产品发布'
    }
  ],
  insights: [
    {
      id: '1',
      title: '大模型价格战加剧，企业成本下降',
      description: 'GPT-5 定价较 GPT-4 下降 30%，Claude Pro 企业版推出优惠套餐。企业应关注模型质量与成本平衡，优先测试多模型组合方案。',
      impact: '建议：建立 A/B 测试机制，对比不同模型在核心场景的表现。'
    },
    {
      id: '2',
      title: 'GPU 供应链紧张将持续到 Q3',
      description: 'TSMC CoWoS 产能扩张计划预计 Q4 才能见效。短期建议通过云厂商 GPU 租赁满足需求，长期应考虑多元化供应商（AMD、Intel）。',
      impact: '建议：提前锁定 Q3-Q4 GPU 预订预算，关注 AMD MI300 产能情况。'
    },
    {
      id: '3',
      title: 'AI Agent 产品化进入加速期',
      description: 'Meta、OpenAI、Microsoft 纷纷推出 Agent 平台。企业应评估内部业务场景，优先在客服、销售、运营等高重复性场景试点 Agent。',
      impact: '建议：启动 Agent 技术调研，识别 2-3 个试点场景，制定 6 个月落地计划。'
    }
  ],
  sections: [
    {
      id: 'funding',
      name: '融资',
      items: [
        {
          id: 'n1',
          title: 'Anthropic 融资 15 亿美元，估值达 400 亿美元',
          summary: '本轮由 Google 领投，将用于 Claude 模型研发和企业版扩展。',
          url: 'https://techcrunch.com/anthropic-funding',
          source: 'TechCrunch',
          publishedAt: '2026-04-12T05:45:00Z',
          category: '融资'
        },
        {
          id: 'n2',
          title: 'AI 芯片初创公司 Cerebras 融资 2.5 亿美元',
          summary: 'SoftBank Vision Fund 领投，资金将用于 WSE-3 芯片量产。',
          url: 'https://reuters.com/cerebras-funding',
          source: 'Reuters',
          publishedAt: '2026-04-12T03:20:00Z',
          category: '融资'
        }
      ]
    },
    {
      id: 'product',
      name: '产品',
      items: [
        {
          id: 'n3',
          title: 'OpenAI 发布 GPT-5 Beta 版',
          summary: '支持 1M token 上下文，推理能力提升 40%。',
          url: 'https://openai.com/blog/gpt-5-beta',
          source: 'OpenAI',
          publishedAt: '2026-04-12T06:30:00Z',
          category: '产品'
        },
        {
          id: 'n4',
          title: 'Meta 发布 AI Agent 平台 AgentGPT',
          summary: '支持自定义工作流，集成 LLaMA 4 模型。',
          url: 'https://ai.meta.com/agentgpt',
          source: 'Meta',
          publishedAt: '2026-04-12T04:20:00Z',
          category: '产品'
        }
      ]
    },
    {
      id: 'partnership',
      name: '合作',
      items: [
        {
          id: 'n5',
          title: 'OpenAI 与 Microsoft 扩展合作至 2030 年',
          summary: 'Azure 将作为 GPT-5 全球独家云服务商，为期 10 年。',
          url: 'https://blogs.microsoft.com/azure',
          source: 'Microsoft',
          publishedAt: '2026-04-12T02:00:00Z',
          category: '合作'
        }
      ]
    },
    {
      id: 'policy',
      name: '政策',
      items: [
        {
          id: 'n6',
          title: '欧盟 AI 法案进入实施阶段',
          summary: '高风险 AI 应用需 6 个月内完成合规审查。',
          url: 'https://ec.europa.eu/ai-act',
          source: '欧盟委员会',
          publishedAt: '2026-04-12T01:30:00Z',
          category: '政策'
        }
      ]
    }
  ]
};

// 技术动态版日报数据
export const techReport: DailyReport = {
  id: 'tech-2026-04-12',
  type: 'tech',
  reportDate: '2026-04-12',
  title: 'AI 技术日报 - 2026年4月12日',
  summary: '今日 AI 技术动态聚焦：大模型架构创新、推理效率优化、开源社区活跃。',
  publishedAt: '2026-04-12T08:00:00Z',
  highlights: [
    {
      id: '1',
      title: 'vLLM 0.6.0 发布，推理性能提升 60%',
      summary: '新增 PagedAttention v2 优化，支持 LLaMA 4、GPT-5 等新模型。GitHub Star 超 50K，成为大模型推理事实标准。',
      source: 'vLLM GitHub',
      url: 'https://github.com/vllm-project/vllm',
      publishedAt: '2026-04-12T07:30:00Z',
      tag: '工程'
    },
    {
      id: '2',
      title: 'DeepSeek-V2 架构论文发布，MoE 参数效率提升 3 倍',
      summary: '提出混合专家网络（Mixture of Experts）优化方案，在保持性能的同时减少 70% 的激活参数。代码已开源。',
      source: 'arXiv cs.AI',
      url: 'https://arxiv.org/abs/2404.xxxxx',
      publishedAt: '2026-04-12T06:00:00Z',
      tag: '论文'
    },
    {
      id: '3',
      title: 'Hugging Face 推出 LLM 评测基准 LLM-Bench v2.0',
      summary: '新增代码生成、长文本理解、多模态任务评测维度。覆盖 50+ 主流模型，支持自定义评测任务。',
      source: 'Hugging Face Blog',
      url: 'https://huggingface.co/blog/llm-bench-v2',
      publishedAt: '2026-04-12T05:15:00Z',
      tag: '工程'
    },
    {
      id: '4',
      title: '论文：KV Cache 压缩技术 DeepKV 减少显存占用 80%',
      summary: 'MIT 研究团队提出 KV Cache 动态压缩方案，在不损失推理质量的情况下，将显存占用从 16GB 降至 3.2GB。',
      source: 'arXiv cs.LG',
      url: 'https://arxiv.org/abs/2404.yyyyy',
      publishedAt: '2026-04-12T04:00:00Z',
      tag: '论文'
    }
  ],
  insights: [
    {
      id: '1',
      title: '推理性能优化仍是技术焦点',
      description: 'vLLM、TensorRT-LLM 等推理框架持续更新，PagedAttention 成为标配。技术团队应关注推理框架选型，测试不同框架的性能表现。',
      impact: '建议：建立推理性能基准测试，对比 vLLM、TensorRT-LLM、TGI 等框架。'
    },
    {
      id: '2',
      title: 'MoE 架构成为大模型新趋势',
      description: 'DeepSeek-V2、LLaMA 4 等模型采用 MoE 架构，参数效率显著提升。技术团队应研究 MoE 架构的工程实现细节。',
      impact: '建议：阅读 DeepSeek-V2 论文，评估 MoE 架构在业务场景中的适用性。'
    },
    {
      id: '3',
      title: 'LLM 评测体系日趋完善',
      description: 'LLM-Bench v2.0 提供了更全面的评测维度。技术团队应建立内部评测体系，定期评估模型更新带来的性能变化。',
      impact: '建议：引入 LLM-Bench，建立模型质量监控看板，每月输出评测报告。'
    }
  ],
  sections: [
    {
      id: 'model',
      name: '模型',
      items: [
        {
          id: 't1',
          title: 'DeepSeek-V2 架构论文发布',
          summary: 'MoE 参数效率提升 3 倍，代码已开源。',
          url: 'https://arxiv.org/abs/2404.xxxxx',
          source: 'arXiv',
          publishedAt: '2026-04-12T06:00:00Z',
          category: '模型'
        },
        {
          id: 't2',
          title: 'LLaMA 4-70B 权重泄露传闻',
          summary: '社交媒体流传 LLaMA 4-70B 非官方权重下载链接。',
          url: 'https://twitter.com/llama4leak',
          source: 'Twitter',
          publishedAt: '2026-04-12T03:00:00Z',
          category: '模型'
        }
      ]
    },
    {
      id: 'engineering',
      name: '工程',
      items: [
        {
          id: 't3',
          title: 'vLLM 0.6.0 发布，推理性能提升 60%',
          summary: '新增 PagedAttention v2 优化，支持 GPT-5。',
          url: 'https://github.com/vllm-project/vllm',
          source: 'GitHub',
          publishedAt: '2026-04-12T07:30:00Z',
          category: '工程'
        },
        {
          id: 't4',
          title: 'TensorRT-LLM 支持 GPT-5 推理',
          summary: 'NVIDIA 发布 TensorRT-LLM 0.10，支持 GPT-5 推理优化。',
          url: 'https://github.com/NVIDIA/TensorRT-LLM',
          source: 'GitHub',
          publishedAt: '2026-04-12T02:30:00Z',
          category: '工程'
        }
      ]
    },
    {
      id: 'paper',
      name: '论文',
      items: [
        {
          id: 't5',
          title: 'KV Cache 压缩技术 DeepKV',
          summary: '减少显存占用 80%，来自 MIT 研究。',
          url: 'https://arxiv.org/abs/2404.yyyyy',
          source: 'arXiv',
          publishedAt: '2026-04-12T04:00:00Z',
          category: '论文'
        },
        {
          id: 't6',
          title: '论文：RAG 检索增强技术综述',
          summary: '总结 2023-2025 年 RAG 技术进展，发布在 AI Magazine。',
          url: 'https://aimagazine.org/rag-survey',
          source: 'AI Magazine',
          publishedAt: '2026-04-12T01:00:00Z',
          category: '论文'
        }
      ]
    },
    {
      id: 'tool',
      name: '工具',
      items: [
        {
          id: 't7',
          title: 'Hugging Face 推出 LLM 评测基准 LLM-Bench v2.0',
          summary: '新增代码生成、长文本理解评测维度。',
          url: 'https://huggingface.co/blog/llm-bench-v2',
          source: 'Hugging Face',
          publishedAt: '2026-04-12T05:15:00Z',
          category: '工具'
        }
      ]
    }
  ]
};

// 产品动态版日报数据
export const productReport: DailyReport = {
  id: 'product-2026-04-12',
  type: 'product',
  reportDate: '2026-04-12',
  title: 'AI 产品日报 - 2026年4月12日',
  summary: '今日 AI 产品动态聚焦：云厂商 AI 服务升级、模型厂商推出企业版、AI 芯片厂商发布新品。',
  publishedAt: '2026-04-12T08:00:00Z',
  highlights: [
    {
      id: '1',
      title: '阿里云推出通义千问 Max 企业版，支持 200K 上下文',
      summary: '新增私有化部署方案，支持企业数据加密存储。企业版定价 ¥0.015/1K tokens，较 GPT-4 低 50%。',
      source: '阿里云官方',
      url: 'https://aliyun.com/product/qianwen-max',
      publishedAt: '2026-04-12T07:00:00Z',
      tag: '云厂商'
    },
    {
      id: '2',
      title: 'OpenAI 发布企业版 GPT-5 Team',
      summary: '支持团队协作，每人每日 10K tokens 免费额度。企业版定价 $25/人/月，包含专属客服和技术支持。',
      source: 'OpenAI',
      url: 'https://openai.com/gpt-5-team',
      publishedAt: '2026-04-12T06:00:00Z',
      tag: '模型厂商'
    },
    {
      id: '3',
      title: 'NVIDIA 发布 B200 GPU 企业版，5 年质保',
      summary: '企业版 B200 售价 $15,000，提供 24/7 技术支持和软件更新。优先向战略客户提供。',
      source: 'NVIDIA',
      url: 'https://nvidia.com/b200-enterprise',
      publishedAt: '2026-04-12T05:00:00Z',
      tag: '芯片厂商'
    },
    {
      id: '4',
      title: 'AI 写作工具 Jasper 发布 AI Agent 版本',
      summary: '支持自动调研、写作、发布全流程，集成 Google Search 和 CMS。企业版定价 $99/月。',
      source: 'Jasper Blog',
      url: 'https://jasper.ai/agent',
      publishedAt: '2026-04-12T04:00:00Z',
      tag: '创业公司'
    }
  ],
  insights: [
    {
      id: '1',
      title: '云厂商 AI 服务价格持续下降',
      description: '阿里云、腾讯云、华为云纷纷降价，企业版价格较 GPT-4 低 40-60%。企业应关注国产模型的质量提升。',
      impact: '建议：建立多模型 A/B 测试，对比国产模型与 GPT-4 在业务场景中的表现。'
    },
    {
      id: '2',
      title: '模型厂商推出企业专属服务',
      description: 'OpenAI、Anthropic、DeepSeek 纷纷推出企业版，提供数据加密、专属客服、SLA 保障。企业应评估企业版的合规性和成本。',
      impact: '建议：对比 OpenAI Enterprise、Anthropic Claude Pro、DeepSeek 企业版的功能和价格。'
    },
    {
      id: '3',
      title: 'AI Agent 产品化加速',
      description: 'Jasper、Notion、Coda 等产品推出 Agent 功能。企业应评估 Agent 功能对内部流程的优化价值。',
      impact: '建议：在文档协作、内容生成、客户服务场景试点 AI Agent。'
    }
  ],
  sections: [
    {
      id: 'cloud-vendor',
      name: '云厂商',
      items: [
        {
          id: 'p1',
          title: '阿里云推出通义千问 Max 企业版',
          summary: '支持 200K 上下文，企业版定价 ¥0.015/1K tokens。',
          url: 'https://aliyun.com/product/qianwen-max',
          source: '阿里云',
          publishedAt: '2026-04-12T07:00:00Z',
          category: '云厂商'
        },
        {
          id: 'p2',
          title: '腾讯云混元模型降价 40%',
          summary: '混元-Lite 定价降至 ¥0.01/1K tokens。',
          url: 'https://cloud.tencent.com/hunyuan',
          source: '腾讯云',
          publishedAt: '2026-04-12T03:00:00Z',
          category: '云厂商'
        }
      ]
    },
    {
      id: 'model-vendor',
      name: '模型厂商',
      items: [
        {
          id: 'p3',
          title: 'OpenAI 发布企业版 GPT-5 Team',
          summary: '支持团队协作，定价 $25/人/月。',
          url: 'https://openai.com/gpt-5-team',
          source: 'OpenAI',
          publishedAt: '2026-04-12T06:00:00Z',
          category: '模型厂商'
        },
        {
          id: 'p4',
          title: 'Anthropic Claude Pro 企业版推出',
          summary: '支持 SSO 集成和审计日志。',
          url: 'https://anthropic.com/claude-pro-enterprise',
          source: 'Anthropic',
          publishedAt: '2026-04-12T02:00:00Z',
          category: '模型厂商'
        }
      ]
    },
    {
      id: 'chip-vendor',
      name: '芯片厂商',
      items: [
        {
          id: 'p5',
          title: 'NVIDIA 发布 B200 GPU 企业版',
          summary: '售价 $15,000，5 年质保。',
          url: 'https://nvidia.com/b200-enterprise',
          source: 'NVIDIA',
          publishedAt: '2026-04-12T05:00:00Z',
          category: '芯片厂商'
        },
        {
          id: 'p6',
          title: 'AMD MI300X 扩产计划公布',
          summary: 'Q3 产能提升 3 倍，应对 AI 需求。',
          url: 'https://amd.com/mi300x-production',
          source: 'AMD',
          publishedAt: '2026-04-12T01:00:00Z',
          category: '芯片厂商'
        }
      ]
    },
    {
      id: 'startup',
      name: '创业公司',
      items: [
        {
          id: 'p7',
          title: 'AI 写作工具 Jasper 发布 AI Agent 版本',
          summary: '支持自动调研、写作、发布全流程。',
          url: 'https://jasper.ai/agent',
          source: 'Jasper',
          publishedAt: '2026-04-12T04:00:00Z',
          category: '创业公司'
        },
        {
          id: 'p8',
          title: 'AI 客服平台 Intercom AI Agent 上线',
          summary: '支持自动回答客户问题，降低 60% 人力成本。',
          url: 'https://intercom.com/ai-agent',
          source: 'Intercom',
          publishedAt: '2026-04-12T03:30:00Z',
          category: '创业公司'
        }
      ]
    }
  ]
};

// 获取日报数据的函数
export function getReport(type: 'market' | 'tech' | 'product', date: string): DailyReport | null {
  const reports = { market: marketReport, tech: techReport, product: productReport };
  return reports[type]?.reportDate === date ? reports[type] : null;
}

// 获取可用的日期列表
export function getAvailableDates(type: 'market' | 'tech' | 'product'): string[] {
  // MVP 只返回今天
  return ['2026-04-12'];
}
