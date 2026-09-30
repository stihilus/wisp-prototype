export type ModelOption = {
  id: string
  name: string
  description: string
  beta?: boolean
}

export const modelOptions: ModelOption[] = [
  { id: 'glm-5-3', name: 'GLM 5.3', description: 'Sharp reasoning and analysis' },
  { id: 'glm-5-3-flash', name: 'GLM 5.3 Flash', description: 'Smart and fast' },
  { id: 'deepseek-v4-flash', name: 'Deepseek V4 Flash', description: 'Quick and frugal' },
  { id: 'kimi-k2-6', name: 'Kimi K2.6', description: 'Creative writing, reads images' },
  { id: 'kimi-k3', name: 'Kimi K3', description: 'Most capable, eats limits very fast', beta: true },
  { id: 'qwen3-8-27b', name: 'QWEN3.8 27B', description: 'Strong coder, reads images', beta: true },
  { id: 'muse-glimmer-30b', name: 'Muse Glimmer 30B', description: 'Reliable with tools, reads images', beta: true },
  { id: 'qwen3-8-uncensored', name: 'QWEN3.8 Uncensored', description: 'Answers without content restrictions' },
]

export type ModelTier = {
  id: string
  name: string
  description: string
}

export const modelTiers: ModelTier[] = [
  { id: 'balanced', name: 'Balanced', description: 'Optimal for everyday tasks' },
  { id: 'advanced', name: 'Advanced', description: 'Best models, for complex tasks' },
]
