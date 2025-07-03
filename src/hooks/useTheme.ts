import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 
  | 'light' 
  | 'dark' 
  | 'focus' 
  | 'midnight' 
  | 'forest' 
  | 'ocean' 
  | 'sunset' 
  | 'neon' 
  | 'minimal' 
  | 'warm';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  category: 'standard' | 'focus' | 'energy' | 'calm';
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderHover: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  effects: {
    blur: string;
    glow: string;
    animation: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright for daytime studying',
    category: 'standard',
    colors: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#ffffff',
      surface: '#f9fafb',
      surfaceHover: '#f3f4f6',
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      borderHover: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      secondary: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      glow: '0 0 20px rgb(234 88 12 / 0.3)',
      animation: 'transition-all duration-200 ease-in-out',
    },
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for night studying',
    category: 'standard',
    colors: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      secondary: '#fb923c',
      accent: '#fed7aa',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: '#334155',
      borderHover: '#475569',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      secondary: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      card: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      glow: '0 0 20px rgb(249 115 22 / 0.4)',
      animation: 'transition-all duration-200 ease-in-out',
    },
  },

  focus: {
    id: 'focus',
    name: 'Focus Mode',
    description: 'Minimal distractions for deep concentration',
    category: 'focus',
    colors: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#fafafa',
      surface: '#ffffff',
      surfaceHover: '#f5f5f5',
      text: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      borderHover: '#d1d5db',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      secondary: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    effects: {
      blur: 'backdrop-blur-sm',
      glow: '0 0 15px rgb(99 102 241 / 0.2)',
      animation: 'transition-all duration-300 ease-out',
    },
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blue theme for late-night study sessions',
    category: 'calm',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      background: '#0c1426',
      surface: '#1e2a4a',
      surfaceHover: '#2d3f66',
      text: '#e2e8f0',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: '#2d3f66',
      borderHover: '#3c5282',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      secondary: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      background: 'linear-gradient(135deg, #0c1426 0%, #1e2a4a 50%, #0c1426 100%)',
      card: 'linear-gradient(135deg, #1e2a4a 0%, #2d3f66 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.6)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.7)',
    },
    effects: {
      blur: 'backdrop-blur-lg',
      glow: '0 0 25px rgb(59 130 246 / 0.3)',
      animation: 'transition-all duration-300 ease-in-out',
    },
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green theme for calm and focused learning',
    category: 'calm',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#ffffff',
      surfaceHover: '#f7fee7',
      text: '#14532d',
      textSecondary: '#166534',
      textMuted: '#4b5563',
      border: '#d1fae5',
      borderHover: '#a7f3d0',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#0ea5e9',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      secondary: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #f7fee7 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(5 150 105 / 0.1)',
      md: '0 4px 6px -1px rgb(5 150 105 / 0.15)',
      lg: '0 10px 15px -3px rgb(5 150 105 / 0.2)',
      xl: '0 20px 25px -5px rgb(5 150 105 / 0.25)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      glow: '0 0 20px rgb(5 150 105 / 0.3)',
      animation: 'transition-all duration-250 ease-out',
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming blue theme inspired by the ocean',
    category: 'calm',
    colors: {
      primary: '#0891b2',
      primaryHover: '#0e7490',
      secondary: '#06b6d4',
      accent: '#67e8f9',
      background: '#f0f9ff',
      surface: '#ffffff',
      surfaceHover: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#075985',
      textMuted: '#64748b',
      border: '#bae6fd',
      borderHover: '#7dd3fc',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      secondary: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(8 145 178 / 0.1)',
      md: '0 4px 6px -1px rgb(8 145 178 / 0.15)',
      lg: '0 10px 15px -3px rgb(8 145 178 / 0.2)',
      xl: '0 20px 25px -5px rgb(8 145 178 / 0.25)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      glow: '0 0 20px rgb(8 145 178 / 0.3)',
      animation: 'transition-all duration-300 ease-in-out',
    },
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink theme for energizing study sessions',
    category: 'energy',
    colors: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      secondary: '#fb7185',
      accent: '#fbbf24',
      background: '#fffbeb',
      surface: '#ffffff',
      surfaceHover: '#fef3c7',
      text: '#92400e',
      textSecondary: '#b45309',
      textMuted: '#78716c',
      border: '#fed7aa',
      borderHover: '#fdba74',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
      secondary: 'linear-gradient(135deg, #fb7185 0%, #fbbf24 100%)',
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(249 115 22 / 0.1)',
      md: '0 4px 6px -1px rgb(249 115 22 / 0.15)',
      lg: '0 10px 15px -3px rgb(249 115 22 / 0.2)',
      xl: '0 20px 25px -5px rgb(249 115 22 / 0.25)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      glow: '0 0 25px rgb(249 115 22 / 0.4)',
      animation: 'transition-all duration-200 ease-out',
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'High-energy cyberpunk theme for intense study sessions',
    category: 'energy',
    colors: {
      primary: '#a855f7',
      primaryHover: '#9333ea',
      secondary: '#ec4899',
      accent: '#06ffa5',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      surfaceHover: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#e5e5e5',
      textMuted: '#a3a3a3',
      border: '#404040',
      borderHover: '#525252',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff0055',
      info: '#00aaff',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      secondary: 'linear-gradient(135deg, #ec4899 0%, #06ffa5 100%)',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      card: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(168 85 247 / 0.3)',
      md: '0 4px 6px -1px rgb(168 85 247 / 0.4)',
      lg: '0 10px 15px -3px rgb(168 85 247 / 0.5)',
      xl: '0 20px 25px -5px rgb(168 85 247 / 0.6)',
    },
    effects: {
      blur: 'backdrop-blur-lg',
      glow: '0 0 30px rgb(168 85 247 / 0.6)',
      animation: 'transition-all duration-150 ease-in-out',
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design for distraction-free learning',
    category: 'focus',
    colors: {
      primary: '#000000',
      primaryHover: '#1f2937',
      secondary: '#4b5563',
      accent: '#6b7280',
      background: '#ffffff',
      surface: '#fafafa',
      surfaceHover: '#f5f5f5',
      text: '#000000',
      textSecondary: '#374151',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      borderHover: '#d1d5db',
      success: '#000000',
      warning: '#000000',
      error: '#000000',
      info: '#000000',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
      secondary: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      card: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.02)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.03)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.08)',
    },
    effects: {
      blur: 'backdrop-blur-none',
      glow: 'none',
      animation: 'transition-all duration-200 ease-linear',
    },
  },

  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Cozy and comfortable theme for relaxed studying',
    category: 'calm',
    colors: {
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      secondary: '#ea580c',
      accent: '#f59e0b',
      background: '#fef7f0',
      surface: '#ffffff',
      surfaceHover: '#fef2e2',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      textMuted: '#78716c',
      border: '#fed7aa',
      borderHover: '#fdba74',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      info: '#2563eb',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
      secondary: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
      background: 'linear-gradient(135deg, #fef7f0 0%, #fef2e2 50%, #fef7f0 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #fef2e2 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(220 38 38 / 0.1)',
      md: '0 4px 6px -1px rgb(220 38 38 / 0.15)',
      lg: '0 10px 15px -3px rgb(220 38 38 / 0.2)',
      xl: '0 20px 25px -5px rgb(220 38 38 / 0.25)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      glow: '0 0 20px rgb(220 38 38 / 0.3)',
      animation: 'transition-all duration-250 ease-out',
    },
  },
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>('studorama-theme', 'light');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(themes[currentTheme]);

  // Apply theme to document
  useEffect(() => {
    const config = themes[currentTheme];
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

  const changeTheme = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    
    // Force a page refresh to ensure all components update properly
    // Use a small delay to allow the theme to be saved first
    setTimeout(() => {
      // Check if we're on mobile or desktop and use appropriate refresh method
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Modern browsers - use location.reload with force refresh
        window.location.reload();
      } else {
        // Fallback for older browsers
        window.location.href = window.location.href;
      }
    }, 100);
  };

  const getThemesByCategory = (category: ThemeConfig['category']) => {
    return Object.values(themes).filter(theme => theme.category === category);
  };

  const getAllThemes = () => {
    return Object.values(themes);
  };

  return {
    currentTheme,
    themeConfig,
    changeTheme,
    getThemesByCategory,
    getAllThemes,
    themes,
  };
}