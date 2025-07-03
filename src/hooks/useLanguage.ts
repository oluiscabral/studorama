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
    
    // Use a more reliable refresh method that works better on mobile browsers and dev servers
    setTimeout(() => {
      try {
        // For language changes, redirect to home page to ensure clean state
        if (typeof window !== 'undefined' && window.location) {
          // Create a clean URL pointing to home page
          const baseUrl = window.location.origin;
          
          // Add cache-busting parameter to ensure fresh load
          const refreshUrl = `${baseUrl}/?_lang_refresh=${Date.now()}`;
          
          // Use location.replace to avoid navigation issues and go to home
          window.location.replace(refreshUrl);
        }
      } catch (error) {
        console.error('Error during language change refresh:', error);
        
        // Fallback: try standard reload
        try {
          window.location.reload();
        } catch (fallbackError) {
          console.error('Fallback refresh also failed:', fallbackError);
          
          // Last resort: redirect to home page
          window.location.href = window.location.origin;
        }
      }
    }, 150); // Slightly longer delay to ensure localStorage is updated
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