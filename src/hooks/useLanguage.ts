import { useState, useEffect } from 'react';
import { Language, LanguageSwitchPreference } from '../types';
import { detectBrowserLanguage, getTranslations } from '../utils/i18n';
import { useLocalStorage } from './useLocalStorage';

export function useLanguage() {
  const [languageSettings, setLanguageSettings] = useLocalStorage<{ language: Language }>('studorama-language', {
    language: detectBrowserLanguage()
  });

  const [languageSwitchPreference, setLanguageSwitchPreference] = useLocalStorage<LanguageSwitchPreference>('studorama-language-switch-preference', {
    rememberChoice: false,
    autoResetPrompts: true
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(languageSettings.language);

  useEffect(() => {
    setCurrentLanguage(languageSettings.language);
  }, [languageSettings.language]);

  const changeLanguage = (newLanguage: Language) => {
    // Update the language setting
    setLanguageSettings({ language: newLanguage });
    setCurrentLanguage(newLanguage);
    
    // Force page refresh to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const updateLanguageSwitchPreference = (preference: Partial<LanguageSwitchPreference>) => {
    setLanguageSwitchPreference(prev => ({ ...prev, ...preference }));
  };

  const resetLanguageSwitchPreference = () => {
    setLanguageSwitchPreference({
      rememberChoice: false,
      autoResetPrompts: true
    });
  };

  const t = getTranslations(currentLanguage);

  return {
    language: currentLanguage,
    changeLanguage,
    languageSwitchPreference,
    updateLanguageSwitchPreference,
    resetLanguageSwitchPreference,
    t
  };
}