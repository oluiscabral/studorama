import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Theme, ThemeConfig } from '../core/types';
import { 
  themes, 
  getAllThemes, 
  getThemesByCategory, 
  getTheme 
} from '../core/services/theme';
import { STORAGE_KEYS, DEFAULTS } from '../core/config/constants';

/**
 * Hook for managing application theme
 */
export function useTheme() {
  // Load theme from localStorage
  const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>(
    STORAGE_KEYS.THEME, 
    DEFAULTS.THEME as Theme
  );
  
  // Local state for theme config
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(getTheme(currentTheme));

  // Apply theme to document when it changes
  useEffect(() => {
    const config = getTheme(currentTheme);
    setThemeConfig(config);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    
    // Colors
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Gradients
    Object.entries(config.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });
    
    // Shadows
    Object.entries(config.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Effects
    Object.entries(config.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentTheme}`);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', config.colors.primary);
    }
    
  }, [currentTheme]);

  /**
   * Change the current theme
   */
  const changeTheme = useCallback((newTheme: Theme) => {
    setCurrentTheme(newTheme);
    // For theme changes, we don't need to refresh the page
    // The useEffect above will handle the theme application
  }, [setCurrentTheme]);

  return {
    currentTheme,
    themeConfig,
    changeTheme,
    getThemesByCategory,
    getAllThemes,
    themes,
  };
}

export type { Theme, ThemeConfig };
