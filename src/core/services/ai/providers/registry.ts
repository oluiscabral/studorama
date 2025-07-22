/**
 * AI Provider Registry with multi-provider support and internationalization
 */

import { AIModel, AIProvider, AIProviderConfig } from '../../../types/ai.types';
import { Language } from '../../../types';

/**
 * OpenAI Provider Configuration
 */
const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Latest and most capable model with multimodal capabilities',
    contextWindow: 128000,
    costTier: 'high',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
    recommended: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Faster and more cost-effective version of GPT-4o',
    contextWindow: 128000,
    costTier: 'medium',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'High performance model with large context window',
    contextWindow: 128000,
    costTier: 'high',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Previous generation flagship model',
    contextWindow: 8192,
    costTier: 'high',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and economical model',
    contextWindow: 16385,
    costTier: 'low',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: false,
      codeGeneration: true,
    },
  },
];

/**
 * Google Gemini Provider Configuration
 */
const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable Gemini model with large context window',
    contextWindow: 2000000,
    costTier: 'medium',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
    recommended: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model for quick responses',
    contextWindow: 1000000,
    costTier: 'low',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Balanced performance and cost',
    contextWindow: 32768,
    costTier: 'medium',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
];

/**
 * Anthropic Claude Provider Configuration
 */
const ANTHROPIC_MODELS: AIModel[] = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Most capable Claude model with excellent reasoning',
    contextWindow: 200000,
    costTier: 'high',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
    recommended: true,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: 'Fast and cost-effective model',
    contextWindow: 200000,
    costTier: 'low',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Most powerful Claude model for complex tasks',
    contextWindow: 200000,
    costTier: 'high',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
];

/**
 * DeepSeek Provider Configuration
 */
const DEEPSEEK_MODELS: AIModel[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'General purpose conversational model',
    contextWindow: 32768,
    costTier: 'low',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
    recommended: true,
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'Specialized model for coding tasks',
    contextWindow: 16384,
    costTier: 'low',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
];

/**
 * Ollama Provider Configuration
 */
const OLLAMA_MODELS: AIModel[] = [
  {
    id: 'llama3.1:8b',
    name: 'Llama 3.1 8B',
    description: 'Efficient local model for general tasks',
    contextWindow: 128000,
    costTier: 'free',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
    recommended: true,
  },
  {
    id: 'llama3.1:70b',
    name: 'Llama 3.1 70B',
    description: 'Large local model with excellent performance',
    contextWindow: 128000,
    costTier: 'free',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'mistral:7b',
    name: 'Mistral 7B',
    description: 'Fast and efficient local model',
    contextWindow: 32768,
    costTier: 'free',
    capabilities: {
      multipleChoice: true,
      dissertative: true,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
  {
    id: 'codellama:13b',
    name: 'Code Llama 13B',
    description: 'Specialized local model for coding tasks',
    contextWindow: 16384,
    costTier: 'free',
    capabilities: {
      multipleChoice: true,
      dissertative: false,
      evaluation: true,
      reasoning: true,
      codeGeneration: true,
    },
  },
];

/**
 * Browser AI Provider Configuration
 */
const BROWSER_MODELS: AIModel[] = [
  {
    id: 'browser-ai',
    name: 'Browser AI',
    description: 'Local AI running in the browser (experimental)',
    contextWindow: 4096,
    costTier: 'free',
    capabilities: {
      multipleChoice: true,
      dissertative: false,
      evaluation: true,
      reasoning: false,
      codeGeneration: false,
    },
    recommended: false,
  },
];

/**
 * Provider configurations with localized content
 */
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'Industry-leading AI models including GPT-4 and GPT-3.5',
    requiresApiKey: true,
    apiKeyLabel: 'OpenAI API Key',
    apiKeyPlaceholder: 'sk-...',
    setupInstructions: [
      'Visit platform.openai.com',
      'Sign in or create an account',
      'Navigate to API Keys section',
      'Create a new secret key',
      'Copy and paste the key here'
    ],
    models: OPENAI_MODELS,
    defaultModel: 'gpt-4o-mini',
    maxTokens: {
      multipleChoice: 800,
      dissertative: 1200,
      evaluation: 600,
    },
    temperature: {
      multipleChoice: 0.7,
      dissertative: 0.8,
      evaluation: 0.6,
    },
  },

  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s advanced AI models with large context windows',
    requiresApiKey: true,
    apiKeyLabel: 'Gemini API Key',
    apiKeyPlaceholder: 'AIza...',
    setupInstructions: [
      'Visit aistudio.google.com',
      'Sign in with Google account',
      'Navigate to API Keys',
      'Create a new API key',
      'Copy and paste the key here'
    ],
    models: GEMINI_MODELS,
    defaultModel: 'gemini-1.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    maxTokens: {
      multipleChoice: 800,
      dissertative: 1200,
      evaluation: 600,
    },
    temperature: {
      multipleChoice: 0.7,
      dissertative: 0.8,
      evaluation: 0.6,
    },
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude models known for safety and reasoning capabilities',
    requiresApiKey: true,
    apiKeyLabel: 'Anthropic API Key',
    apiKeyPlaceholder: 'sk-ant-...',
    setupInstructions: [
      'Visit console.anthropic.com',
      'Sign in or create an account',
      'Navigate to API Keys',
      'Create a new API key',
      'Copy and paste the key here'
    ],
    models: ANTHROPIC_MODELS,
    defaultModel: 'claude-3-haiku-20240307',
    baseUrl: 'https://api.anthropic.com/v1',
    maxTokens: {
      multipleChoice: 800,
      dissertative: 1200,
      evaluation: 600,
    },
    temperature: {
      multipleChoice: 0.7,
      dissertative: 0.8,
      evaluation: 0.6,
    },
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Cost-effective AI models with strong performance',
    requiresApiKey: true,
    apiKeyLabel: 'DeepSeek API Key',
    apiKeyPlaceholder: 'sk-...',
    setupInstructions: [
      'Visit platform.deepseek.com',
      'Sign in or create an account',
      'Navigate to API Keys',
      'Create a new API key',
      'Copy and paste the key here'
    ],
    models: DEEPSEEK_MODELS,
    defaultModel: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    maxTokens: {
      multipleChoice: 800,
      dissertative: 1200,
      evaluation: 600,
    },
    temperature: {
      multipleChoice: 0.7,
      dissertative: 0.8,
      evaluation: 0.6,
    },
  },

  ollama: {
    id: 'ollama',
    name: 'Ollama',
    description: 'Run AI models locally on your machine',
    requiresApiKey: false,
    apiKeyLabel: '',
    apiKeyPlaceholder: '',
    setupInstructions: [
      'Install Ollama from ollama.ai',
      'Run "ollama serve" to start the server',
      'Pull a model with "ollama pull llama3.1:8b"',
      'Configure the base URL if different from default'
    ],
    models: OLLAMA_MODELS,
    defaultModel: 'llama3.1:8b',
    baseUrl: 'http://localhost:11434/v1',
    maxTokens: {
      multipleChoice: 800,
      dissertative: 1200,
      evaluation: 600,
    },
    temperature: {
      multipleChoice: 0.7,
      dissertative: 0.8,
      evaluation: 0.6,
    },
  },

  browser: {
    id: 'browser',
    name: 'Browser AI',
    description: 'Experimental local AI running in the browser',
    requiresApiKey: false,
    apiKeyLabel: '',
    apiKeyPlaceholder: '',
    setupInstructions: [
      'Enable experimental web features in your browser',
      'This feature is experimental and may not work in all browsers',
      'Performance may be limited compared to cloud-based models'
    ],
    models: BROWSER_MODELS,
    defaultModel: 'browser-ai',
    maxTokens: {
      multipleChoice: 400,
      dissertative: 600,
      evaluation: 300,
    },
    temperature: {
      multipleChoice: 0.7,
      dissertative: 0.8,
      evaluation: 0.6,
    },
  },
};

/**
 * Get provider configuration by ID
 */
export function getProviderConfig(providerId: AIProvider): AIProviderConfig {
  const config = AI_PROVIDERS[providerId];
  if (!config) {
    throw new Error(`Provider not found: ${providerId}`);
  }
  return config;
}

/**
 * Get all available providers
 */
export function getAllProviders(): AIProviderConfig[] {
  return Object.values(AI_PROVIDERS);
}

/**
 * Get providers that don't require API keys
 */
export function getFreeProviders(): AIProviderConfig[] {
  return Object.values(AI_PROVIDERS).filter(provider => !provider.requiresApiKey);
}

/**
 * Get model by provider and model ID
 */
export function getModel(providerId: AIProvider, modelId: string): AIModel | undefined {
  const provider = getProviderConfig(providerId);
  return provider.models.find(model => model.id === modelId);
}

/**
 * Get localized provider name
 */
export function getLocalizedProviderName(providerId: AIProvider, language: Language): string {
  const provider = getProviderConfig(providerId);
  
  // Return localized name based on provider
  switch (providerId) {
    case 'openai':
      return 'OpenAI';
    case 'gemini':
      return 'Google Gemini';
    case 'anthropic':
      return 'Anthropic Claude';
    case 'deepseek':
      return 'DeepSeek';
    case 'ollama':
      return 'Ollama';
    case 'browser':
      return language === 'pt-BR' ? 'IA do Navegador' : 'Browser AI';
    default:
      return provider.name;
  }
}

/**
 * Get localized provider description
 */
export function getLocalizedProviderDescription(providerId: AIProvider, language: Language): string {
  switch (providerId) {
    case 'openai':
      return language === 'pt-BR' 
        ? 'Modelos de IA líderes da indústria incluindo GPT-4 e GPT-3.5'
        : 'Industry-leading AI models including GPT-4 and GPT-3.5';
    case 'gemini':
      return language === 'pt-BR'
        ? 'Modelos avançados de IA do Google com grandes janelas de contexto'
        : 'Google\'s advanced AI models with large context windows';
    case 'anthropic':
      return language === 'pt-BR'
        ? 'Modelos Claude conhecidos por segurança e capacidades de raciocínio'
        : 'Claude models known for safety and reasoning capabilities';
    case 'deepseek':
      return language === 'pt-BR'
        ? 'Modelos de IA econômicos com forte desempenho'
        : 'Cost-effective AI models with strong performance';
    case 'ollama':
      return language === 'pt-BR'
        ? 'Execute modelos de IA localmente em sua máquina'
        : 'Run AI models locally on your machine';
    case 'browser':
      return language === 'pt-BR'
        ? 'IA local experimental executando no navegador'
        : 'Experimental local AI running in the browser';
    default:
      // @ts-ignore
      return AI_PROVIDERS[providerId].description;
  }
}

/**
 * Get localized model name
 */
export function getLocalizedModelName(providerId: AIProvider, modelId: string, _language: Language): string {
  const model = getModel(providerId, modelId);
  if (!model) return modelId;
  
  // Most model names are the same across languages, but we can add specific cases
  return model.name;
}

/**
 * Get localized model description
 */
export function getLocalizedModelDescription(
  providerId: AIProvider, 
  modelId: string,
  language: Language
): string {
  const model = getModel(providerId, modelId);
  if (!model) return '';
  
  // For now, we'll provide Portuguese translations for key model descriptions
  if (language === 'pt-BR') {
    switch (modelId) {
      case 'gpt-4o':
        return 'Modelo mais recente e capaz com capacidades multimodais';
      case 'gpt-4o-mini':
        return 'Versão mais rápida e econômica do GPT-4o';
      case 'gpt-4-turbo':
        return 'Modelo de alta performance com grande janela de contexto';
      case 'gpt-4':
        return 'Modelo principal da geração anterior';
      case 'gpt-3.5-turbo':
        return 'Modelo rápido e econômico';
      case 'gemini-1.5-pro':
        return 'Modelo Gemini mais capaz com grande janela de contexto';
      case 'gemini-1.5-flash':
        return 'Modelo rápido e eficiente para respostas rápidas';
      case 'gemini-pro':
        return 'Performance e custo equilibrados';
      case 'claude-3-5-sonnet-20241022':
        return 'Modelo Claude mais capaz com excelente raciocínio';
      case 'claude-3-haiku-20240307':
        return 'Modelo rápido e econômico';
      case 'claude-3-opus-20240229':
        return 'Modelo Claude mais poderoso para tarefas complexas';
      case 'deepseek-chat':
        return 'Modelo conversacional de propósito geral';
      case 'deepseek-coder':
        return 'Modelo especializado para tarefas de programação';
      case 'llama3.1:8b':
        return 'Modelo local eficiente para tarefas gerais';
      case 'llama3.1:70b':
        return 'Modelo local grande com excelente performance';
      case 'mistral:7b':
        return 'Modelo local rápido e eficiente';
      case 'codellama:13b':
        return 'Modelo local especializado para tarefas de programação';
      case 'browser-ai':
        return 'IA local executando no navegador (experimental)';
      default:
        return model.description;
    }
  }
  
  return model.description;
}

/**
 * Get localized setup instructions
 */
export function getLocalizedSetupInstructions(providerId: AIProvider, language: Language): string[] {
  const provider = getProviderConfig(providerId);
  
  if (language === 'pt-BR') {
    switch (providerId) {
      case 'openai':
        return [
          'Visite platform.openai.com',
          'Faça login ou crie uma conta',
          'Navegue até a seção de Chaves da API',
          'Crie uma nova chave secreta',
          'Copie e cole a chave aqui'
        ];
      case 'gemini':
        return [
          'Visite aistudio.google.com',
          'Faça login com conta Google',
          'Navegue até Chaves da API',
          'Crie uma nova chave da API',
          'Copie e cole a chave aqui'
        ];
      case 'anthropic':
        return [
          'Visite console.anthropic.com',
          'Faça login ou crie uma conta',
          'Navegue até Chaves da API',
          'Crie uma nova chave da API',
          'Copie e cole a chave aqui'
        ];
      case 'deepseek':
        return [
          'Visite platform.deepseek.com',
          'Faça login ou crie uma conta',
          'Navegue até Chaves da API',
          'Crie uma nova chave da API',
          'Copie e cole a chave aqui'
        ];
      case 'ollama':
        return [
          'Instale o Ollama de ollama.ai',
          'Execute "ollama serve" para iniciar o servidor',
          'Baixe um modelo com "ollama pull llama3.1:8b"',
          'Configure a URL base se diferente do padrão'
        ];
      case 'browser':
        return [
          'Habilite recursos experimentais da web no seu navegador',
          'Este recurso é experimental e pode não funcionar em todos os navegadores',
          'A performance pode ser limitada comparada a modelos baseados em nuvem'
        ];
      default:
        return provider.setupInstructions;
    }
  }
  
  return provider.setupInstructions;
}

/**
 * Get localized API key label
 */
export function getLocalizedApiKeyLabel(providerId: AIProvider, language: Language): string {
  if (language === 'pt-BR') {
    switch (providerId) {
      case 'openai':
        return 'Chave da API OpenAI';
      case 'gemini':
        return 'Chave da API Gemini';
      case 'anthropic':
        return 'Chave da API Anthropic';
      case 'deepseek':
        return 'Chave da API DeepSeek';
      default:
        return 'Chave da API';
    }
  }
  
  return AI_PROVIDERS[providerId].apiKeyLabel || 'API Key';
}

/**
 * Get localized cost tier
 */
export function getLocalizedCostTier(costTier: string, language: Language): string {
  if (language === 'pt-BR') {
    switch (costTier) {
      case 'free':
        return 'Gratuito';
      case 'low':
        return 'Baixo Custo';
      case 'medium':
        return 'Custo Médio';
      case 'high':
        return 'Alto Custo';
      default:
        return costTier;
    }
  }
  
  switch (costTier) {
    case 'free':
      return 'Free';
    case 'low':
      return 'Low Cost';
    case 'medium':
      return 'Medium Cost';
    case 'high':
      return 'High Cost';
    default:
      return costTier;
  }
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(
  providerId: AIProvider, 
  settings: { apiKey?: string; model?: string; baseUrl?: string },
  language: Language = 'en-US'
): { valid: boolean; errors: string[] } {
  const provider = getProviderConfig(providerId);
  const errors: string[] = [];
  
  // Check API key requirement
  if (provider.requiresApiKey && !settings.apiKey) {
    const errorMsg = language === 'pt-BR' 
      ? `Chave da API é obrigatória para ${getLocalizedProviderName(providerId, language)}`
      : `API key is required for ${provider.name}`;
    errors.push(errorMsg);
  }
  
  // Check model validity
  if (settings.model && !provider.models.find(m => m.id === settings.model)) {
    const errorMsg = language === 'pt-BR'
      ? `Modelo inválido: ${settings.model}`
      : `Invalid model: ${settings.model}`;
    errors.push(errorMsg);
  }
  
  // Check base URL for local providers
  if (providerId === 'ollama' && settings.baseUrl) {
    try {
      new URL(settings.baseUrl);
    } catch {
      const errorMsg = language === 'pt-BR'
        ? 'Formato de URL base inválido'
        : 'Invalid base URL format';
      errors.push(errorMsg);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
