import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, LanguageSwitchPreference } from '../core/types';
import { detectBrowserLanguage, getTranslations } from '../core/services/i18n';
import { STORAGE_KEYS } from '../core/config/constants';

/**
 * Hook for managing application language and translations
 */
export function useLanguage() {
  // Load language settings from localStorage
  const [languageSettings, setLanguageSettings] = useLocalStorage<{ language: Language }>(
    STORAGE_KEYS.LANGUAGE,
    { language: detectBrowserLanguage() }
  );

  // Load language switch preferences from localStorage
  const [languageSwitchPreference, setLanguageSwitchPreference] = useLocalStorage<LanguageSwitchPreference>(
    STORAGE_KEYS.LANGUAGE_SWITCH_PREFERENCE,
    { rememberChoice: false, autoResetPrompts: true }
  );

  // Local state for current language
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languageSettings.language);

  // Update local state when localStorage changes
  useEffect(() => {
    setCurrentLanguage(languageSettings.language);
  }, [languageSettings.language]);

  /**
   * Change the application language
   */
  const changeLanguage = useCallback((newLanguage: Language) => {
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
  }, [setLanguageSettings]);

  /**
   * Update language switch preferences
   */
  const updateLanguageSwitchPreference = useCallback((preference: Partial<LanguageSwitchPreference>) => {
    setLanguageSwitchPreference(prev => ({ ...prev, ...preference }));
  }, [setLanguageSwitchPreference]);

  /**
   * Reset language switch preferences to defaults
   */
  const resetLanguageSwitchPreference = useCallback(() => {
    setLanguageSwitchPreference({
      rememberChoice: false,
      autoResetPrompts: true
    });
  }, [setLanguageSwitchPreference]);

  // Get translations for current language
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