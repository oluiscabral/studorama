import { useState, useEffect } from 'react';
import { Language } from '../types';
import { detectBrowserLanguage, getTranslations } from '../utils/i18n';
import { useLocalStorage } from './useLocalStorage';

export function useLanguage() {
  const [languageSettings, setLanguageSettings] = useLocalStorage<{ language: Language }>('studorama-language', {
    language: detectBrowserLanguage()
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(languageSettings.language);

  useEffect(() => {
    setCurrentLanguage(languageSettings.language);
  }, [languageSettings.language]);

  const changeLanguage = (newLanguage: Language) => {
    setLanguageSettings({ language: newLanguage });
    setCurrentLanguage(newLanguage);
  };

  const t = getTranslations(currentLanguage);

  return {
    language: currentLanguage,
    changeLanguage,
    t
  };
}