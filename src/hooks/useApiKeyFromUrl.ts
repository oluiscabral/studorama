import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useLanguage } from './useLanguage';
import { APISettings } from '../core/types';
import { showNotification } from '../core/services/notification';
import { STORAGE_KEYS, DEFAULTS, API } from '../core/config/constants';

/**
 * Hook to extract and use API key from URL parameters
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
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const apiKeyFromUrl = urlParams.get('apikey') || urlParams.get('api_key') || urlParams.get('key');
      const modelFromUrl = urlParams.get('model');
      
      if (apiKeyFromUrl) {
        // Validate API key format (basic validation)
        if (apiKeyFromUrl.startsWith(API.OPENAI_KEY_PREFIX) && apiKeyFromUrl.length > 20) {
          // Only update if the API key is different from the current one
          if (apiKeyFromUrl !== apiSettings.openaiApiKey) {
            const updatedSettings = {
              ...apiSettings,
              openaiApiKey: apiKeyFromUrl,
              ...(modelFromUrl && { model: modelFromUrl })
            };
            
            setApiSettings(updatedSettings);
            
            // Show success notification with translated text
            showNotification({
              type: 'success',
              title: t.apiKeyConfigured,
              message: `${t.apiKeyConfiguredDesc}. ${t.usingModel} ${updatedSettings.model}`,
              duration: 5000
            });
            
            // Clean up URL parameters to avoid showing API key in browser history
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('apikey');
            cleanUrl.searchParams.delete('api_key');
            cleanUrl.searchParams.delete('key');
            cleanUrl.searchParams.delete('model');
            
            // Only update URL if parameters were actually removed
            if (window.location.href !== cleanUrl.toString()) {
              window.history.replaceState({}, document.title, cleanUrl.toString());
            }
          }
        } else {
          // Invalid API key format - show translated error
          console.warn('Invalid API key format in URL parameter. API key should start with "sk-" and be at least 20 characters long.');
          
          showNotification({
            type: 'error',
            title: t.invalidApiKey,
            message: t.invalidApiKeyDesc,
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error processing URL parameters:', error);
    }
  }, [apiSettings, setApiSettings, t]); // Include translations in dependencies

  return {
    apiSettings,
    hasApiKey: !!apiSettings.openaiApiKey
  };
}