import React from 'react';
import { X, RefreshCw, Globe } from 'lucide-react';
import { Language } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import IconButton from './ui/IconButton';

interface LanguageSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (resetPrompts: boolean, rememberChoice: boolean) => void;
  currentLanguage: Language;
  newLanguage: Language;
}

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
];

export default function LanguageSwitchModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentLanguage, 
  newLanguage 
}: LanguageSwitchModalProps) {
  const { t } = useLanguage();
  const { themeConfig } = useTheme();
  const [resetPrompts, setResetPrompts] = React.useState(true);
  const [rememberChoice, setRememberChoice] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.value === currentLanguage);
  const newLang = LANGUAGES.find(l => l.value === newLanguage);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Close modal first to prevent any UI conflicts
    onClose();
    
    // Small delay to ensure modal is closed before triggering language change
    setTimeout(() => {
      onConfirm(resetPrompts, rememberChoice);
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderColor: themeConfig.colors.border
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeConfig.colors.info + '20' }}
              >
                <Globe className="w-5 h-5" style={{ color: themeConfig.colors.info }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                {t.languageChange}
              </h2>
            </div>
            <IconButton
              icon={X}
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Close modal"
            />
          </div>

          {/* Language Change Info */}
          <div className="mb-6">
            <div 
              className="border rounded-lg p-4"
              style={{
                backgroundColor: themeConfig.colors.info + '10',
                borderColor: themeConfig.colors.info + '30'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{currentLang?.flag}</span>
                  <span className="text-sm" style={{ color: themeConfig.colors.info }}>
                    {currentLang?.label}
                  </span>
                </div>
                <div style={{ color: themeConfig.colors.info }}>→</div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{newLang?.flag}</span>
                  <span className="text-sm" style={{ color: themeConfig.colors.info }}>
                    {newLang?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Refresh Warning */}
          <div className="mb-6">
            <div 
              className="border rounded-lg p-4"
              style={{
                backgroundColor: themeConfig.colors.warning + '10',
                borderColor: themeConfig.colors.warning + '30'
              }}
            >
              <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.warning }}>
                🔄 {t.languageChange} - {language === 'pt-BR' ? 'Aviso Importante' : 'Important Notice'}
              </h4>
              <p className="text-sm" style={{ color: themeConfig.colors.warning }}>
                {language === 'pt-BR' 
                  ? 'A página será recarregada e você será redirecionado para a página inicial para aplicar o novo idioma. Isso é necessário para garantir que todas as traduções sejam aplicadas corretamente.'
                  : 'The page will refresh and you will be redirected to the home page to apply the new language. This is necessary to ensure all translations are applied correctly.'
                }
              </p>
            </div>
          </div>

          {/* Reset Prompts Option */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={resetPrompts}
                onChange={(e) => setResetPrompts(e.target.checked)}
                className="w-5 h-5 rounded focus:ring-2 mt-0.5 flex-shrink-0"
                style={{
                  accentColor: themeConfig.colors.primary,
                  '--tw-ring-color': themeConfig.colors.primary,
                }}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <RefreshCw className="w-4 h-4" style={{ color: themeConfig.colors.primary }} />
                  <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                    {t.resetPromptsOption}
                  </span>
                </div>
                <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.resetPromptsDescription}
                </p>
              </div>
            </label>
          </div>

          {/* Remember Choice Option */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="w-5 h-5 rounded focus:ring-2 mt-0.5 flex-shrink-0"
                style={{
                  accentColor: themeConfig.colors.info,
                  '--tw-ring-color': themeConfig.colors.info,
                }}
              />
              <div className="flex-1">
                <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                  {t.rememberChoice}
                </span>
                <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.rememberChoiceDescription}
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeConfig.colors.surface,
                color: themeConfig.colors.textSecondary,
                border: `1px solid ${themeConfig.colors.border}`
              }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeConfig.colors.primary,
                color: '#ffffff'
              }}
            >
              {t.confirmChange}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}