import { Language } from '../../types';
import { SUPPORTED_LANGUAGES, DEFAULTS } from '../../config/constants';

/**
 * Detect the browser's language and return the closest supported language
 */
export function detectBrowserLanguage(): Language {
  // Default language as fallback
  const defaultLanguage = DEFAULTS.LANGUAGE as Language;
  
  try {
    // Get browser language
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
    
    if (!browserLang) {
      return defaultLanguage;
    }
    
    // Check if the browser language is directly supported
    if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
      return browserLang as Language;
    }
    
    // Check for language prefix match (e.g., 'pt-PT' should match 'pt-BR')
    const prefix = browserLang.split('-')[0];
    
    for (const supportedLang of SUPPORTED_LANGUAGES) {
      if (supportedLang.startsWith(prefix)) {
        return supportedLang as Language;
      }
    }
    
    // No match found, return default
    return defaultLanguage;
  } catch (error) {
    console.error('Error detecting browser language:', error);
    return defaultLanguage;
  }
}

/**
 * Format a date according to the current language
 */
export function formatDate(date: string, language: Language): string {
  try {
    const dateObj = new Date(date);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return dateObj.toLocaleDateString(language, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
}

/**
 * Get a random placeholder for subject modifiers based on language
 */
export function getRandomModifierPlaceholder(language: Language): string {
  // Random modifier placeholders by language
  const MODIFIER_PLACEHOLDERS: Record<Language, string[]> = {
    'en-US': [
      'Introduction to Computer Science by David J. Malan',
      'Chapter 3: Data Structures',
      'MIT OpenCourseWare 6.006',
      'Algorithms by Robert Sedgewick',
      'Section 2.1: Elementary Sorts',
      'Khan Academy: Linear Algebra',
      'Calculus: Early Transcendentals by James Stewart',
      'Physics for Scientists and Engineers by Serway',
      'Organic Chemistry by Paula Bruice',
      'Microeconomics by Paul Krugman'
    ],
    'pt-BR': [
      'Introdução à Ciência da Computação por David J. Malan',
      'Capítulo 3: Estruturas de Dados',
      'MIT OpenCourseWare 6.006',
      'Algoritmos por Robert Sedgewick',
      'Seção 2.1: Ordenações Elementares',
      'Khan Academy: Álgebra Linear',
      'Cálculo: Transcendentais Iniciais por James Stewart',
      'Física para Cientistas e Engenheiros por Serway',
      'Química Orgânica por Paula Bruice',
      'Microeconomia por Paul Krugman'
    ]
  };

  const placeholders = MODIFIER_PLACEHOLDERS[language] || MODIFIER_PLACEHOLDERS['en-US'];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}