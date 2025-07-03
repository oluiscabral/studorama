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
    
    // Use a more reliable refresh method that always goes to home page
    setTimeout(() => {
      try {
        // Always redirect to home page to avoid 404 errors
        const baseUrl = window.location.origin;
        const homeUrl = `${baseUrl}/`;
        
        // Use window.location.href for the most reliable redirect
        window.location.href = homeUrl;
      } catch (error) {
        console.error('Error during language change redirect:', error);
        
        // Fallback: try to reload the current page
        try {
          window.location.reload();
        } catch (fallbackError) {
          console.error('Fallback reload also failed:', fallbackError);
          
          // Last resort: force navigation to home
          try {
            window.location.replace('/');
          } catch (lastResortError) {
            console.error('All redirect methods failed:', lastResortError);
          }
        }
      }
    }, 200); // Longer delay to ensure localStorage is fully updated
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