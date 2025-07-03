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

export type ThemeCategory = 'standard' | 'focus' | 'energy' | 'calm';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  category: ThemeCategory;
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