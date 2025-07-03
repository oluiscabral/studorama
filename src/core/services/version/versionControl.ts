import { PRESERVED_STORAGE_KEYS, APP_VERSION, STORAGE_KEYS } from '../../config/constants';
import * as localStorage from '../storage/localStorage';

/**
 * Get the stored application version
 */
export function getStoredVersion(): string | null {
  return localStorage.getItem<string | null>(STORAGE_KEYS.VERSION, null);
}

/**
 * Set the current application version in storage
 */
export function setStoredVersion(version: string): void {
  localStorage.setItem(STORAGE_KEYS.VERSION, version);
}

/**
 * Check if the current version differs from the stored version
 */
export function isVersionChanged(): boolean {
  const storedVersion = getStoredVersion();
  return storedVersion !== null && storedVersion !== APP_VERSION;
}

/**
 * Check if this is a fresh installation (no stored version)
 */
export function isFreshInstallation(): boolean {
  return getStoredVersion() === null;
}

/**
 * Clear all localStorage data except preserved keys
 */
export function clearStorageExceptPreserved(): void {
  const allKeys = localStorage.getAllKeys();
  
  // Remove all keys except preserved ones
  allKeys.forEach(key => {
    if (!PRESERVED_STORAGE_KEYS.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  console.log(`Cleared ${allKeys.length - PRESERVED_STORAGE_KEYS.length} localStorage items due to version change`);
}

/**
 * Handle version migration
 * Returns true if migration was performed, false otherwise
 */
export function handleVersionMigration(): boolean {
  const storedVersion = getStoredVersion();
  
  // Fresh installation - just set the current version
  if (isFreshInstallation()) {
    setStoredVersion(APP_VERSION);
    console.log(`Fresh installation detected. Set version to ${APP_VERSION}`);
    return false;
  }
  
  // Version changed - perform migration
  if (isVersionChanged()) {
    console.log(`Version change detected: ${storedVersion} → ${APP_VERSION}`);
    
    // Clear storage except preserved keys
    clearStorageExceptPreserved();
    
    // Update stored version
    setStoredVersion(APP_VERSION);
    
    // Show migration notification
    showMigrationNotification(storedVersion!, APP_VERSION);
    
    return true;
  }
  
  // No version change
  return false;
}

/**
 * Show a notification about version migration
 */
function showMigrationNotification(oldVersion: string, newVersion: string): void {
  try {
    // Try to get translations
    let title = 'Studorama Updated!';
    let versionText = `Updated from v${oldVersion} to v${newVersion}`;
    let dataText = 'Your data has been refreshed for the new version. Your API key has been preserved.';
    
    // Try to detect language from localStorage
    try {
      const languageSettings = localStorage.getItem<{ language: string }>(STORAGE_KEYS.LANGUAGE, { language: 'en-US' });
      if (languageSettings.language === 'pt-BR') {
        title = 'Studorama Atualizado!';
        versionText = `Atualizado da v${oldVersion} para v${newVersion}`;
        dataText = 'Seus dados foram atualizados para a nova versão. Sua chave da API foi preservada.';
      }
    } catch (e) {
      // Ignore language detection errors
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 400px;
      animation: slideInFromRight 0.4s ease-out;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#migration-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'migration-notification-styles';
      style.textContent = `
        @keyframes slideInFromRight {
          from { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        @keyframes slideOutToRight {
          from { 
            transform: translateX(0); 
            opacity: 1; 
          }
          to { 
            transform: translateX(100%); 
            opacity: 0; 
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }
    
    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="
          width: 24px; 
          height: 24px; 
          background: rgba(255,255,255,0.2); 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0;
          animation: pulse 2s infinite;
        ">
          🚀
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 15px;">
            ${title}
          </div>
          <div style="opacity: 0.95; font-size: 13px; line-height: 1.4; margin-bottom: 8px;">
            ${versionText}
          </div>
          <div style="opacity: 0.9; font-size: 12px; line-height: 1.3;">
            ${dataText}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 8 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutToRight 0.4s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, 8000);
    
    // Allow manual dismissal by clicking
    notification.addEventListener('click', () => {
      notification.style.animation = 'slideOutToRight 0.4s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    });
    
  } catch (error) {
    console.error('Error showing migration notification:', error);
  }
}

/**
 * Get version information for debugging
 */
export function getVersionInfo() {
  return {
    currentVersion: APP_VERSION,
    storedVersion: getStoredVersion(),
    isVersionChanged: isVersionChanged(),
    isFreshInstallation: isFreshInstallation(),
    preservedKeys: PRESERVED_STORAGE_KEYS,
  };
}