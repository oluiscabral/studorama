import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface ApiSettings {
  openaiApiKey: string;
  model: string;
  customPrompts: {
    multipleChoice: string;
    dissertative: string;
    evaluation: string;
    elaborativePrompt: string;
    retrievalPrompt: string;
  };
  preloadQuestions?: number;
}

export function useApiKeyFromUrl() {
  const [apiSettings, setApiSettings] = useLocalStorage<ApiSettings>('studorama-api-settings', {
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: {
      multipleChoice: '',
      dissertative: '',
      evaluation: '',
      elaborativePrompt: '',
      retrievalPrompt: ''
    },
    preloadQuestions: 3
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const apiKeyFromUrl = urlParams.get('apikey') || urlParams.get('api_key') || urlParams.get('key');
      const modelFromUrl = urlParams.get('model');
      
      if (apiKeyFromUrl) {
        // Validate API key format (basic validation)
        if (apiKeyFromUrl.startsWith('sk-') && apiKeyFromUrl.length > 20) {
          // Only update if the API key is different from the current one
          if (apiKeyFromUrl !== apiSettings.openaiApiKey) {
            const updatedSettings = {
              ...apiSettings,
              openaiApiKey: apiKeyFromUrl,
              ...(modelFromUrl && { model: modelFromUrl })
            };
            
            setApiSettings(updatedSettings);
            
            // Show success notification
            const message = `API key has been automatically configured from URL. Model: ${updatedSettings.model}`;
            
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 16px 20px;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
              z-index: 10000;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              font-size: 14px;
              font-weight: 500;
              max-width: 350px;
              animation: slideIn 0.3s ease-out;
            `;
            
            // Add animation keyframes
            if (!document.querySelector('#notification-styles')) {
              const style = document.createElement('style');
              style.id = 'notification-styles';
              style.textContent = `
                @keyframes slideIn {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                  from { transform: translateX(0); opacity: 1; }
                  to { transform: translateX(100%); opacity: 0; }
                }
              `;
              document.head.appendChild(style);
            }
            
            notification.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ✓
                </div>
                <div>
                  <div style="font-weight: 600; margin-bottom: 2px;">API Key Configured</div>
                  <div style="opacity: 0.9; font-size: 12px;">${message}</div>
                </div>
              </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              notification.style.animation = 'slideOut 0.3s ease-in forwards';
              setTimeout(() => {
                if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
                }
              }, 300);
            }, 5000);
            
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
          // Invalid API key format
          console.warn('Invalid API key format in URL parameter. API key should start with "sk-" and be at least 20 characters long.');
          
          // Show error notification
          const errorNotification = document.createElement('div');
          errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
          `;
          
          errorNotification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 20px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ⚠
              </div>
              <div>
                <div style="font-weight: 600; margin-bottom: 2px;">Invalid API Key</div>
                <div style="opacity: 0.9; font-size: 12px;">The API key in the URL is not valid. Please check the format.</div>
              </div>
            </div>
          `;
          
          document.body.appendChild(errorNotification);
          
          setTimeout(() => {
            errorNotification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
              if (errorNotification.parentNode) {
                errorNotification.parentNode.removeChild(errorNotification);
              }
            }, 300);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error processing URL parameters:', error);
    }
  }, []); // Empty dependency array - only run once on mount

  return {
    apiSettings,
    hasApiKey: !!apiSettings.openaiApiKey
  };
}