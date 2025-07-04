import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useLanguage } from './useLanguage';
import { APISettings } from '../core/types';
import { showNotification } from '../core/services/notification';
import { STORAGE_KEYS, DEFAULTS, API } from '../core/config/constants';
import * as localStorage from '../core/services/storage/localStorage';

/**
 * Extract API key from URL immediately (before version control)
 * This prevents the API key from being lost during version migrations
 */
function extractApiKeyFromUrl(): { apiKey: string | null; model: string | null } {
  if (typeof window === 'undefined') return { apiKey: null, model: null };

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get('apikey') || urlParams.get('api_key') || urlParams.get('key');
    const model = urlParams.get('model');
    
    return { apiKey, model };
  } catch (error) {
    console.error('Error extracting API key from URL:', error);
    return { apiKey: null, model: null };
  }
}

/**
 * Clean URL parameters to avoid showing API key in browser history
 */
function cleanUrlParameters(): void {
  if (typeof window === 'undefined') return;

  try {
    const cleanUrl = new URL(window.location.href);
    const hadParams = cleanUrl.searchParams.has('apikey') || 
                     cleanUrl.searchParams.has('api_key') || 
                     cleanUrl.searchParams.has('key') || 
                     cleanUrl.searchParams.has('model');
    
    if (hadParams) {
      cleanUrl.searchParams.delete('apikey');
      cleanUrl.searchParams.delete('api_key');
      cleanUrl.searchParams.delete('key');
      cleanUrl.searchParams.delete('model');
      
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  } catch (error) {
    console.error('Error cleaning URL parameters:', error);
  }
}

/**
 * Process API key from URL and store it immediately
 * This runs before version control to preserve the API key during migrations
 */
export function processApiKeyFromUrl(): void {
  const { apiKey, model } = extractApiKeyFromUrl();
  
  if (apiKey) {
    // Validate API key format (basic validation)
    if (apiKey.startsWith(API.OPENAI_KEY_PREFIX) && apiKey.length > 20) {
      try {
        // Get current settings or use defaults
        const currentSettings = localStorage.getItem<APISettings>(STORAGE_KEYS.API_SETTINGS, {
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

        // Only update if the API key is different
        if (apiKey !== currentSettings.openaiApiKey) {
          const updatedSettings = {
            ...currentSettings,
            openaiApiKey: apiKey,
            ...(model && { model: model })
          };
          
          // Store immediately using enhanced localStorage service
          localStorage.setItem(STORAGE_KEYS.API_SETTINGS, updatedSettings);
          
          console.log('API key extracted and stored from URL');
        }
        
        // Clean URL parameters immediately
        cleanUrlParameters();
      } catch (error) {
        console.error('Error storing API key from URL:', error);
      }
    } else {
      console.warn('Invalid API key format in URL parameter');
      cleanUrlParameters();
    }
  }
}

/**
 * Hook to extract and use API key from URL parameters
 * This now only handles notifications since the actual extraction happens earlier
 */
export function useApiKeyFromUrl() {
  const [apiSettings, setApiSettings] = useLocalStorage<APISettings>(STORAGE_KEYS.API_SETTINGS, {
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
  
  const { t } = useLanguage();

  useEffect(() => {
    // Check if we just processed an API key from URL
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("apikey") || urlParams.get("api_key") || urlParams.get("key");

    if (apiKey) {
      setApiSettings((s) => ({
        ...s,
        openaiApiKey: apiKey,
      }));
    }
    
    // If there was an API key in URL but URL is now clean, show success notification
    if (!apiKey && apiSettings.openaiApiKey && 
        (window.location.search === '' || !window.location.search.includes('apikey'))) {
      // Small delay to ensure translations are loaded
      setTimeout(() => {
        showNotification({
          type: 'success',
          title: t.apiKeyConfigured,
          message: `${t.apiKeyConfiguredDesc}. ${t.usingModel} ${apiSettings.model}`,
          duration: 5000
        });
      }, 1000);
    }
  }, [apiSettings, t]);

  return {
    apiSettings,
    hasApiKey: !!apiSettings.openaiApiKey
  };
}