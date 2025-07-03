import { Check, Focus, Palette, Sun, Waves, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { getLocalizedCategoryName, getLocalizedThemeDescription, getLocalizedThemeName } from '../../core/services/theme/themeRegistry';
import { ThemeCategory, ThemeConfig } from '../../core/types';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import IconButton from './IconButton';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const categoryIcons: Record<ThemeCategory, React.ComponentType<any>> = {
  standard: Sun,
  focus: Focus,
  energy: Zap,
  calm: Waves,
};

export default function ThemeSelector({ className = '', showLabel = true }: ThemeSelectorProps) {
  const { currentTheme, changeTheme, getAllThemes, getThemesByCategory, themeConfig } = useTheme();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>('all');

  const allThemes = getAllThemes();
  const categories: ThemeCategory[] = ['standard', 'focus', 'energy', 'calm'];

  const filteredThemes = selectedCategory === 'all' 
    ? allThemes 
    : getThemesByCategory(selectedCategory);

  const handleThemeChange = (theme: string) => {
    changeTheme(theme as any);
    setIsOpen(false);
  };

  const getThemePreview = (theme: ThemeConfig) => {
    return (
      <div className="flex space-x-1">
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderColor: themeConfig.colors.border,
          color: themeConfig.colors.text,
          '--tw-ring-color': themeConfig.colors.primary,
        }}
        aria-label={language === 'pt-BR' ? 'Selecionar tema' : 'Select theme'}
      >
        <Palette className="w-4 h-4" style={{ color: themeConfig.colors.textSecondary }} />
        {showLabel && (
          <span className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
            {t.theme}
          </span>
        )}
        <div className="flex space-x-1">
          <div 
            className="w-3 h-3 rounded-full border"
            style={{ 
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.border
            }}
          />
        </div>
      </button>

      {/* Theme Selector Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal - Fixed positioning to prevent overflow */}
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-xl shadow-xl border z-50 overflow-hidden max-h-[80vh]"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border,
            }}
          >
            {/* Header */}
            <div 
              className="p-4 border-b"
              style={{ borderColor: themeConfig.colors.border }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                  {t.selectTheme}
                </h3>
                <IconButton
                  icon={X}
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  aria-label={language === 'pt-BR' ? 'Fechar seletor de tema' : 'Close theme selector'}
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1 mt-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-white'
                      : ''
                  }`}
                  style={{
                    backgroundColor: selectedCategory === 'all' ? themeConfig.colors.primary : 'transparent',
                    color: selectedCategory === 'all' ? '#ffffff' : themeConfig.colors.textSecondary,
                  }}
                >
                  {language === 'pt-BR' ? 'Todos' : 'All'}
                </button>
                {categories.map((category) => {
                  const Icon = categoryIcons[category];
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors`}
                      style={{
                        backgroundColor: selectedCategory === category ? themeConfig.colors.primary : 'transparent',
                        color: selectedCategory === category ? '#ffffff' : themeConfig.colors.textSecondary,
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{getLocalizedCategoryName(category, language)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Grid - Scrollable */}
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      currentTheme === theme.id
                        ? 'shadow-sm'
                        : ''
                    }`}
                    style={{
                      background: theme.gradients.card,
                      borderColor: currentTheme === theme.id ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    {/* Theme Preview */}
                    <div className="mb-2">
                      {getThemePreview(theme)}
                    </div>
                    
                    {/* Theme Info */}
                    <div className="text-left">
                      <div className="flex items-center justify-between">
                        <h4 
                          className="font-medium text-sm"
                          style={{ color: theme.colors.text }}
                        >
                          {getLocalizedThemeName(theme.id, language)}
                        </h4>
                        {currentTheme === theme.id && (
                          <Check className="w-4 h-4" style={{ color: theme.colors.primary }} />
                        )}
                      </div>
                      <p 
                        className="text-xs mt-1 leading-tight"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {getLocalizedThemeDescription(theme.id, language)}
                      </p>
                      
                      {/* Category Badge */}
                      <div className="mt-2">
                        <span 
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: theme.colors.primary + '20',
                            color: theme.colors.primary,
                          }}
                        >
                          {React.createElement(categoryIcons[theme.category], { 
                            className: "w-3 h-3" 
                          })}
                          <span>{getLocalizedCategoryName(theme.category, language)}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div 
              className="p-4 border-t"
              style={{ 
                borderColor: themeConfig.colors.border,
                backgroundColor: themeConfig.colors.background + '80'
              }}
            >
              <p className="text-xs text-center" style={{ color: themeConfig.colors.textMuted }}>
                {language === 'pt-BR' 
                  ? 'Temas otimizados para diferentes estilos de aprendizado'
                  : 'Themes optimized for different learning styles'
                }
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}