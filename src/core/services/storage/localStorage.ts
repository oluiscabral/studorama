/**
 * Enhanced localStorage service with error handling, type safety, and performance optimizations
 */

// Cache for frequently accessed items to reduce JSON parsing
const cache = new Map<string, { value: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds cache TTL

/**
 * Check if a value is corrupted (like "[object Object]")
 */
function isCorruptedValue(item: string): boolean {
  return item === '[object Object]' || 
         item === '[object Array]' || 
         item === 'undefined' || 
         item === 'null' ||
         (item.startsWith('[object ') && item.endsWith(']'));
}

/**
 * Get an item from localStorage with type safety and caching
 */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    // Check cache first
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value;
    }

    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    // Check for corrupted data
    if (isCorruptedValue(item)) {
      console.warn(`Corrupted data detected for localStorage key "${key}": ${item}. Using default value.`);
      // Remove corrupted data
      window.localStorage.removeItem(key);
      return defaultValue;
    }

    const parsed = JSON.parse(item);
    
    // Update cache
    cache.set(key, { value: parsed, timestamp: Date.now() });
    
    return parsed;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    
    // If parsing failed, try to clean up corrupted data
    try {
      const item = window.localStorage.getItem(key);
      if (item && isCorruptedValue(item)) {
        console.warn(`Removing corrupted localStorage key "${key}"`);
        window.localStorage.removeItem(key);
      }
    } catch (cleanupError) {
      console.error(`Error cleaning up corrupted localStorage key "${key}":`, cleanupError);
    }
    
    return defaultValue;
  }
}

/**
 * Set an item in localStorage with error handling and cache invalidation
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    
    // Validate that serialization worked correctly
    if (isCorruptedValue(serialized)) {
      console.error(`Attempted to store corrupted value for key "${key}": ${serialized}`);
      return false;
    }
    
    window.localStorage.setItem(key, serialized);
    
    // Update cache
    cache.set(key, { value, timestamp: Date.now() });
    
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    
    // If quota exceeded, try to clear old cache entries
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage quota exceeded, clearing cache...');
      cache.clear();
      
      // Try again after clearing cache
      try {
        const serialized = JSON.stringify(value);
        if (!isCorruptedValue(serialized)) {
          window.localStorage.setItem(key, serialized);
          cache.set(key, { value, timestamp: Date.now() });
          return true;
        }
      } catch (retryError) {
        console.error(`Retry failed for localStorage key "${key}":`, retryError);
      }
    }
    
    return false;
  }
}

/**
 * Remove an item from localStorage and cache
 */
export function removeItem(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    cache.delete(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage and cache
 */
export function clearAll(): boolean {
  try {
    window.localStorage.clear();
    cache.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get all keys in localStorage
 */
export function getAllKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
}

/**
 * Check if a key exists in localStorage
 */
export function hasKey(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Get the size of localStorage in bytes
 */
export function getStorageSize(): number {
  try {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        size += key.length + value.length;
      }
    }
    return size;
  } catch (error) {
    console.error('Error calculating localStorage size:', error);
    return 0;
  }
}

/**
 * Clear cache manually (useful for testing or memory management)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    totalMemory: JSON.stringify(Array.from(cache.values())).length
  };
}

/**
 * Clean up corrupted localStorage entries
 */
export function cleanupCorruptedEntries(): number {
  let cleanedCount = 0;
  
  try {
    const keys = getAllKeys();
    
    for (const key of keys) {
      try {
        const item = window.localStorage.getItem(key);
        if (item && isCorruptedValue(item)) {
          console.warn(`Cleaning up corrupted localStorage entry: ${key}`);
          window.localStorage.removeItem(key);
          cache.delete(key);
          cleanedCount++;
        }
      } catch (error) {
        console.error(`Error checking localStorage key "${key}" for corruption:`, error);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} corrupted localStorage entries`);
    }
  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
  }
  
  return cleanedCount;
}