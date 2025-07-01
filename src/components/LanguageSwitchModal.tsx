import React from 'react';
import { X, RefreshCw, Globe } from 'lucide-react';
import { Language } from '../types';
import { useLanguage } from '../hooks/useLanguage';

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
  const [resetPrompts, setResetPrompts] = React.useState(true);
  const [rememberChoice, setRememberChoice] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.value === currentLanguage);
  const newLang = LANGUAGES.find(l => l.value === newLanguage);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(resetPrompts, rememberChoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t.languageChange}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Language Change Info */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{currentLang?.flag}</span>
                  <span className="text-sm text-blue-800">{currentLang?.label}</span>
                </div>
                <div className="text-blue-600">→</div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{newLang?.flag}</span>
                  <span className="text-sm text-blue-800">{newLang?.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Prompts Option */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={resetPrompts}
                onChange={(e) => setResetPrompts(e.target.checked)}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-gray-900">
                    {t.resetPromptsOption}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
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
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  {t.rememberChoice}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {t.rememberChoiceDescription}
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-medium transition-colors"
            >
              {t.confirmChange}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}