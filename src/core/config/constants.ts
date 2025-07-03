/**
 * Application-wide constants
 */

// Current application version
export const APP_VERSION = '1.2.0';

// Local storage keys
export const STORAGE_KEYS = {
  API_SETTINGS: 'studorama-api-settings',
  LANGUAGE: 'studorama-language',
  LANGUAGE_SWITCH_PREFERENCE: 'studorama-language-switch-preference',
  SESSIONS: 'studorama-sessions',
  THEME: 'studorama-theme',
  TIMER_PREFERENCES: 'studorama-timer-preferences',
  VERSION: 'studorama-app-version'
};

// Default values
export const DEFAULTS = {
  LANGUAGE: 'en-US',
  THEME: 'light',
  PRELOAD_QUESTIONS: 3,
  MODEL: 'gpt-4o-mini',
  SESSION_TIMER: 30, // minutes
  QUESTION_TIMER: 60 // seconds
};

// API related constants
export const API = {
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_KEY_PREFIX: 'sk-'
};

// Supported languages
export const SUPPORTED_LANGUAGES = ['en-US', 'pt-BR'];

// Supported themes
export const THEME_CATEGORIES = ['standard', 'focus', 'energy', 'calm'] as const;

// Cache names for service worker
export const CACHE_NAMES = {
  STATIC: `studorama-static-v${APP_VERSION}`,
  DYNAMIC: `studorama-dynamic-v${APP_VERSION}`,
  MAIN: `studorama-v${APP_VERSION}`
};

// Static files to cache
export const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png'
];

// Keys to preserve during version migration
export const PRESERVED_STORAGE_KEYS = [
  STORAGE_KEYS.API_SETTINGS,
  STORAGE_KEYS.VERSION
];