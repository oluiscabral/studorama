/**
 * Version Control System for Studorama
 * Manages application versioning and selective data clearing
 */

// Current application version - update this when releasing new versions
export const CURRENT_VERSION = '1.0.0';

// Version storage key
const VERSION_STORAGE_KEY = 'studorama-app-version';

// Keys to preserve during version-based storage clearing
const PRESERVED_KEYS = [
  'studorama-api-settings', // Preserve API key and settings
  VERSION_STORAGE_KEY,      // Preserve version info
];

/**
 * Get the stored application version
 */
export function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error reading stored version:', error);
    return null;
  }
}

/**
 * Set the current application version in storage
 */
export function setStoredVersion(version: string): void {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
  } catch (error) {
    console.error('Error storing version:', error);
  }
}

/**
 * Check if the current version differs from the stored version
 */
export function isVersionChanged(): boolean {
  const storedVersion = getStoredVersion();
  return storedVersion !== null && storedVersion !== CURRENT_VERSION;
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
  try {
    // Get all localStorage keys
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }

    // Remove all keys except preserved ones
    allKeys.forEach(key => {
      if (!PRESERVED_KEYS.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    console.log(`Cleared ${allKeys.length - PRESERVED_KEYS.length} localStorage items due to version change`);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Handle version migration
 * Returns true if migration was performed, false otherwise
 */
export function handleVersionMigration(): boolean {
  const storedVersion = getStoredVersion();
  
  // Fresh installation - just set the current version
  if (isFreshInstallation()) {
    setStoredVersion(CURRENT_VERSION);
    console.log(`Fresh installation detected. Set version to ${CURRENT_VERSION}`);
    return false;
  }
  
  // Version changed - perform migration
  if (isVersionChanged()) {
    console.log(`Version change detected: ${storedVersion} → ${CURRENT_VERSION}`);
    
    // Clear storage except preserved keys
    clearStorageExceptPreserved();
    
    // Update stored version
    setStoredVersion(CURRENT_VERSION);
    
    // Show migration notification
    showMigrationNotification(storedVersion!, CURRENT_VERSION);
    
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
            Studorama Updated!
          </div>
          <div style="opacity: 0.95; font-size: 13px; line-height: 1.4; margin-bottom: 8px;">
            Updated from v${oldVersion} to v${newVersion}
          </div>
          <div style="opacity: 0.9; font-size: 12px; line-height: 1.3;">
            Your data has been refreshed for the new version. Your API key has been preserved.
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
    currentVersion: CURRENT_VERSION,
    storedVersion: getStoredVersion(),
    isVersionChanged: isVersionChanged(),
    isFreshInstallation: isFreshInstallation(),
    preservedKeys: PRESERVED_KEYS,
  };
}

/**
 * Force a version migration (useful for testing)
 */
export function forceMigration(): void {
  console.log('Forcing version migration...');
  clearStorageExceptPreserved();
  setStoredVersion(CURRENT_VERSION);
  showMigrationNotification('0.0.0', CURRENT_VERSION);
}