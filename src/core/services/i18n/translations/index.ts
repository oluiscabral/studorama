import { Language, Translations } from '../../../types';
import { enUS } from './en-US';
import { ptBR } from './pt-BR';

// Map of all available translations
const translationsMap: Record<Language, Translations> = {
  'en-US': enUS,
  'pt-BR': ptBR
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: Language): Translations {
  return translationsMap[language] || translationsMap['en-US'];
}

/**
 * Get all available translations
 */
export function getAllTranslations(): Record<Language, Translations> {
  return translationsMap;
}

/**
 * Add a new language to the translations map
 * This allows for dynamic language additions
 */
export function addLanguage(language: Language, translations: Translations): void {
  translationsMap[language] = translations;
}