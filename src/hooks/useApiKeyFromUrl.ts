import { useEffect } from 'react';
import { DEFAULTS, STORAGE_KEYS } from '../core/config/constants';
import { getProviderConfig, validateProviderConfig } from '../core/services/ai/providers/registry';
import { showNotification } from '../core/services/notification';
import * as localStorage from '../core/services/storage/localStorage';
import { APISettings } from '../core/types';
import { AIProvider } from '../core/types/ai.types';
import { useLanguage } from './useLanguage';
import { useLocalStorage } from './useLocalStorage';

// Multi-provider settings interface
interface MultiProviderSettings {
  currentProvider: AIProvider;
  providers: Record<AIProvider, {
    apiKey: string;
    model: string;
    baseUrl?: string;
    customHeaders?: Record<string, string>;
  }>;
}

/**
 * Extract API key and provider info from URL immediately (before version control)
 * This prevents the API key from being lost during version migrations
 */
function extractApiKeyFromUrl(): { 
  apiKey: string | null; 
  model: string | null; 
  provider: AIProvider | null;
  baseUrl: string | null;
} {
  if (typeof window === 'undefined') return { apiKey: null, model: null, provider: null, baseUrl: null };

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get('apikey') || urlParams.get('api_key') || urlParams.get('key');
    const model = urlParams.get('model');
    const provider = urlParams.get('provider') as AIProvider;
    const baseUrl = urlParams.get('baseUrl') || urlParams.get('base_url');
    
    return { apiKey, model, provider, baseUrl };
  } catch (error) {
    console.error('Error extracting API key from URL:', error);
    return { apiKey: null, model: null, provider: null, baseUrl: null };
  }
}

/**
 * Clean URL parameters to avoid showing API key in browser history
 */
function cleanUrlParameters(): void {
  if (typeof window === "undefined") return;

  try {
    const cleanUrl = new URL(window.location.href);
    const hadParams = cleanUrl.searchParams.has('apikey') || 
                     cleanUrl.searchParams.has('api_key') || 
                     cleanUrl.searchParams.has('key') || 
                     cleanUrl.searchParams.has('model') ||
                     cleanUrl.searchParams.has('provider') ||
                     cleanUrl.searchParams.has('baseUrl') ||
                     cleanUrl.searchParams.has('base_url');
    
    if (hadParams) {
      cleanUrl.searchParams.delete('apikey');
      cleanUrl.searchParams.delete('api_key');
      cleanUrl.searchParams.delete('key');
      cleanUrl.searchParams.delete('model');
      cleanUrl.searchParams.delete('provider');
      cleanUrl.searchParams.delete('baseUrl');
      cleanUrl.searchParams.delete('base_url');
      
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  } catch (error) {
    console.error("Error cleaning URL parameters:", error);
  }
}

/**
 * Detect provider from API key format
 */
function detectProviderFromApiKey(apiKey: string): AIProvider {
  if (apiKey.startsWith('sk-')) return 'openai';
  if (apiKey.startsWith('AIza')) return 'gemini';
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';
  if (apiKey.startsWith('sk-') && apiKey.includes('deepseek')) return 'deepseek';
  
  // Default to OpenAI for backward compatibility
  return 'openai';
}

/**
 * Validate API key format for provider
 */
function validateApiKeyFormat(apiKey: string, provider: AIProvider): boolean {
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'gemini':
      return apiKey.startsWith('AIza') && apiKey.length > 20;
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    case 'deepseek':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'ollama':
    case 'browser':
      return true; // These don't require API keys
    default:
      return apiKey.length > 10; // Generic validation
  }
}

/**
 * Process API key and provider from URL and store it immediately
 * This runs before version control to preserve the API key during migrations
 */
export function processApiKeyFromUrl(): void {
  const { apiKey, model, provider: urlProvider, baseUrl } = extractApiKeyFromUrl();
  
  if (apiKey) {
    // Detect or use specified provider
    const detectedProvider = urlProvider || detectProviderFromApiKey(apiKey);
    
    // Validate API key format for the provider
    if (validateApiKeyFormat(apiKey, detectedProvider)) {
      try {
        // Get current multi-provider settings or use defaults
        const currentMultiSettings = localStorage.getItem<MultiProviderSettings>('studorama-multi-provider-settings', {
          currentProvider: 'openai',
          providers: {
            openai: { apiKey: '', model: 'gpt-4o-mini' },
            gemini: { apiKey: '', model: 'gemini-1.5-flash' },
            anthropic: { apiKey: '', model: 'claude-3-haiku-20240307' },
            deepseek: { apiKey: '', model: 'deepseek-chat' },
            ollama: { apiKey: '', model: 'llama3.1:8b', baseUrl: 'http://localhost:11434/v1' },
            browser: { apiKey: '', model: 'browser-ai' },
          }
        });
        
        // Get provider config for default model
        const providerConfig = getProviderConfig(detectedProvider);
        const defaultModel = model || providerConfig.defaultModel;
        
        // Update the specific provider settings
        const updatedProviderSettings = {
          ...currentMultiSettings.providers[detectedProvider],
          apiKey: apiKey,
          model: defaultModel,
          ...(baseUrl && { baseUrl: baseUrl })
        };
        
        // Validate the updated settings
        const validation = validateProviderConfig(detectedProvider, updatedProviderSettings);
        
        if (validation.valid) {
          const updatedMultiSettings = {
            ...currentMultiSettings,
            currentProvider: detectedProvider,
            providers: {
              ...currentMultiSettings.providers,
              [detectedProvider]: updatedProviderSettings
            }
          };
          
          // Store multi-provider settings
          localStorage.setItem('studorama-multi-provider-settings', updatedMultiSettings);
          
          // Also update legacy settings for backward compatibility
          const legacySettings = localStorage.getItem<APISettings>(STORAGE_KEYS.API_SETTINGS, {
            openaiApiKey: '',
            model: DEFAULTS.MODEL,
            customPrompts: {
              multipleChoice: '',
              dissertative: '',
              evaluation: '',
              elaborativePrompt: '',
              retrievalPrompt: ''
            },
            preloadQuestions: DEFAULTS.PRELOAD_QUESTIONS
          });

          // Update legacy settings if it's OpenAI
          if (detectedProvider === 'openai') {
            const updatedLegacySettings = {
              ...legacySettings,
              openaiApiKey: apiKey,
              model: defaultModel
            };
            localStorage.setItem(STORAGE_KEYS.API_SETTINGS, updatedLegacySettings);
          }
          
          // Set a flag to show notification later
          localStorage.setItem('studorama-api-key-from-url', JSON.stringify({
            provider: detectedProvider,
            model: defaultModel,
            hasBaseUrl: !!baseUrl
          }));
          
          console.log(`${detectedProvider.toUpperCase()} API key extracted and stored from URL`);
        } else {
          console.warn(`Invalid ${detectedProvider.toUpperCase()} configuration:`, validation.errors);
          // Set error flag for notification
          localStorage.setItem('studorama-api-key-error', JSON.stringify({
            provider: detectedProvider,
            errors: validation.errors
          }));
        }

        // Clean URL parameters immediately
        cleanUrlParameters();
      } catch (error) {
        console.error('Error storing API key from URL:', error);
        cleanUrlParameters();
      }
    } else {
      console.warn(`Invalid API key format for ${detectedProvider.toUpperCase()} in URL parameter`);
      // Set error flag for notification
      localStorage.setItem('studorama-api-key-error', JSON.stringify({
        provider: detectedProvider,
        errors: [`Invalid API key format for ${detectedProvider.toUpperCase()}`]
      }));
      cleanUrlParameters();
    }
  }
}

/**
 * Hook to extract and use API key from URL parameters
 * This now handles multi-provider settings and shows appropriate notifications
 */
export function useApiKeyFromUrl() {
  // Load both legacy and multi-provider settings
  const [apiSettings] = useLocalStorage<APISettings>(STORAGE_KEYS.API_SETTINGS, {
    openaiApiKey: "",
    model: DEFAULTS.MODEL,
    customPrompts: {
      multipleChoice: "",
      dissertative: "",
      evaluation: "",
      elaborativePrompt: "",
      retrievalPrompt: "",
    },
    preloadQuestions: DEFAULTS.PRELOAD_QUESTIONS,
  });
  
  const [multiProviderSettings] = useLocalStorage<MultiProviderSettings>('studorama-multi-provider-settings', {
    currentProvider: 'openai',
    providers: {
      openai: { apiKey: '', model: 'gpt-4o-mini' },
      gemini: { apiKey: '', model: 'gemini-1.5-flash' },
      anthropic: { apiKey: '', model: 'claude-3-haiku-20240307' },
      deepseek: { apiKey: '', model: 'deepseek-chat' },
      ollama: { apiKey: '', model: 'llama3.1:8b', baseUrl: 'http://localhost:11434/v1' },
      browser: { apiKey: '', model: 'browser-ai' },
    }
  });
  
  const { t } = useLanguage();

  useEffect(() => {
    // Check if we should show the API key success notification
    const successData = localStorage.getItem<any>('studorama-api-key-from-url', null);
    
    if (successData) {
      // Remove the flag immediately to prevent showing again
      localStorage.removeItem("studorama-api-key-from-url");

      // Small delay to ensure translations are loaded
      setTimeout(() => {
        const providerName = successData.provider?.toUpperCase() || 'AI';
        const modelInfo = successData.model ? ` ${t.usingModel} ${successData.model}` : '';
        const baseUrlInfo = successData.hasBaseUrl ? ' with custom base URL' : '';
        
        showNotification({
          type: "success",
          title: t.apiKeyConfigured,
          message: `${providerName} ${t.apiKeyConfiguredDesc}.${modelInfo}${baseUrlInfo}`,
          duration: 6000,
        });
      }, 1000);
    }
    
    // Check if we should show an error notification
    const errorData = localStorage.getItem<any>('studorama-api-key-error', null);
    
    if (errorData) {
      // Remove the flag immediately to prevent showing again
      localStorage.removeItem('studorama-api-key-error');
      
      // Small delay to ensure translations are loaded
      setTimeout(() => {
        const providerName = errorData.provider?.toUpperCase() || 'AI';
        const errors = errorData.errors?.join(', ') || 'Unknown error';
        
        showNotification({
          type: 'error',
          title: t.invalidApiKey,
          message: `${providerName}: ${errors}`,
          duration: 8000,
        });
      }, 1000);
    }
  }, [t]);

  // Determine if we have a valid API key for the current provider
  const currentProvider = multiProviderSettings.currentProvider;
  const currentProviderSettings = multiProviderSettings.providers[currentProvider];
  const providerConfig = getProviderConfig(currentProvider);
  
  // For providers that don't require API keys, consider them as "having" a key
  const hasApiKey = !providerConfig.requiresApiKey || !!currentProviderSettings.apiKey;
  
  return {
    // Legacy compatibility
    apiSettings,
    hasApiKey: hasApiKey,
    
    // Multi-provider support
    multiProviderSettings,
    currentProvider,
    currentProviderSettings,
    providerConfig
  };
}
