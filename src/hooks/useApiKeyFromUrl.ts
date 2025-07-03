import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useLanguage } from './useLanguage';

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
        if (apiKeyFromUrl.startsWith('sk-') && apiKeyFromUrl.length > 20) {
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

// Enhanced notification system with translations support
function showNotification({ 
  type, 
  title, 
  message, 
  duration = 5000 
}: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}) {
  try {
    // Color schemes for different notification types
    const colorSchemes = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: '✓'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: '⚠'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        icon: 'ℹ'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: '⚠'
      }
    };

    const scheme = colorSchemes[type];
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${scheme.background};
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
      cursor: pointer;
      user-select: none;
    `;
    
    // Add animation keyframes if not already present
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
          ${scheme.icon}
        </div>
        <div>
          <div style="font-weight: 600; margin-bottom: 2px;">${title}</div>
          <div style="opacity: 0.9; font-size: 12px; line-height: 1.4;">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after specified duration
    const removeNotification = () => {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    };
    
    setTimeout(removeNotification, duration);
    
    // Allow manual dismissal by clicking
    notification.addEventListener('click', removeNotification);
    
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}