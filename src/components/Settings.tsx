import React, { useState, useEffect } from 'react';
import { Save, Key, Globe, Info, Trash2, RefreshCw, Settings as SettingsIcon, Palette } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { Language } from '../types';
import LanguageSwitchModal from './LanguageSwitchModal';
import ThemeSelector from './ThemeSelector';

const DEFAULT_PROMPTS = {
  multipleChoice: '',
  dissertative: '',
  evaluation: '',
  elaborativePrompt: '',
  retrievalPrompt: ''
};

export default function Settings() {
  const { t, language, changeLanguage, languageSwitchPreference, updateLanguageSwitchPreference, resetLanguageSwitchPreference } = useLanguage();
  const { currentTheme, themeConfig } = useTheme();
  const [apiSettings, setApiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: DEFAULT_PROMPTS,
    preloadQuestions: 3 // Default to 3 questions ahead
  });
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'appearance' | 'language' | 'data'>('api');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const handleSave = () => {
    setApiSettings(apiSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return;
    
    if (languageSwitchPreference.rememberChoice) {
      // Auto-reset prompts if remembered
      if (languageSwitchPreference.autoResetPrompts) {
        setApiSettings(prev => ({
          ...prev,
          customPrompts: DEFAULT_PROMPTS
        }));
      }
      changeLanguage(newLanguage);
    } else {
      // Show modal for user choice
      setPendingLanguage(newLanguage);
      setShowLanguageModal(true);
    }
  };

  const handleLanguageModalConfirm = (resetPrompts: boolean, rememberChoice: boolean) => {
    if (!pendingLanguage) return;

    // Update language switch preference
    updateLanguageSwitchPreference({
      rememberChoice,
      autoResetPrompts: resetPrompts
    });

    // Reset prompts if requested
    if (resetPrompts) {
      setApiSettings(prev => ({
        ...prev,
        customPrompts: DEFAULT_PROMPTS
      }));
    }

    // Change language
    changeLanguage(pendingLanguage);
    setPendingLanguage(null);
  };

  const deleteAllData = () => {
    const confirmMessage = t.deleteAllDataConfirm;
    const warningMessage = t.deleteAllDataWarning;
    
    if (confirm(`${confirmMessage}\n\n${warningMessage}`)) {
      // Clear all localStorage data that starts with 'studorama-'
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('studorama-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      alert(t.allDataDeleted);
      
      // Reload the page to reset the application state
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'api' as const, label: t.apiConfiguration, icon: Key },
    { id: 'appearance' as const, label: t.appearance, icon: Palette },
    { id: 'language' as const, label: t.language, icon: Globe },
    { id: 'data' as const, label: t.dataManagement, icon: Trash2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: themeConfig.colors.primary + '20' }}
        >
          <SettingsIcon 
            className="w-8 h-8" 
            style={{ color: themeConfig.colors.primary }}
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: themeConfig.colors.text }}>
          {t.settingsTitle}
        </h1>
        <p style={{ color: themeConfig.colors.textSecondary }}>{t.configurePreferences}</p>
      </div>

      {/* Tabs */}
      <div 
        className="rounded-xl shadow-sm border"
        style={{ 
          backgroundColor: themeConfig.colors.surface,
          borderColor: themeConfig.colors.border 
        }}
      >
        <div className="border-b" style={{ borderColor: themeConfig.colors.border }}>
          <nav className="flex space-x-1 p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === id
                    ? 'text-white'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === id ? themeConfig.colors.primary : 'transparent',
                  color: activeTab === id ? '#ffffff' : themeConfig.colors.textSecondary,
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* API Configuration Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {t.openaiApiConfig}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.textSecondary }}>
                      {t.openaiApiKey}
                    </label>
                    <input
                      type="password"
                      id="apiKey"
                      value={apiSettings.openaiApiKey}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                      }}
                    />
                    <p className="text-sm mt-2" style={{ color: themeConfig.colors.textMuted }}>{t.apiKeyStored}</p>
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.textSecondary }}>
                      {t.openaiModel}
                    </label>
                    <select
                      id="model"
                      value={apiSettings.model}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                      }}
                    >
                      <option value="gpt-4o">{t.gpt4oRecommended}</option>
                      <option value="gpt-4o-mini">{t.gpt4oMini}</option>
                      <option value="gpt-4-turbo">{t.gpt4Turbo}</option>
                      <option value="gpt-4">{t.gpt4}</option>
                      <option value="gpt-3.5-turbo">{t.gpt35Turbo}</option>
                    </select>
                    <div className="mt-2 text-sm" style={{ color: themeConfig.colors.textMuted }}>
                      {apiSettings.model === 'gpt-4o' && t.latestMostCapable}
                      {apiSettings.model === 'gpt-4o-mini' && t.fasterCostEffective}
                      {apiSettings.model === 'gpt-4-turbo' && t.highPerformance}
                      {apiSettings.model === 'gpt-4' && t.previousGeneration}
                      {apiSettings.model === 'gpt-3.5-turbo' && t.fastEconomical}
                    </div>
                  </div>

                  {/* Question Preloading Setting */}
                  <div>
                    <label htmlFor="preloadQuestions" className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.textSecondary }}>
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4" style={{ color: themeConfig.colors.accent }} />
                        <span>
                          {language === 'pt-BR' ? 'Questões Pré-carregadas' : 'Preloaded Questions'}
                        </span>
                      </div>
                    </label>
                    <select
                      id="preloadQuestions"
                      value={apiSettings.preloadQuestions || 3}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, preloadQuestions: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors"
                      style={{
                        backgroundColor: themeConfig.colors.background,
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.text,
                      }}
                    >
                      <option value={0}>{language === 'pt-BR' ? 'Desabilitado (0)' : 'Disabled (0)'}</option>
                      <option value={1}>1 {language === 'pt-BR' ? 'questão' : 'question'}</option>
                      <option value={2}>2 {language === 'pt-BR' ? 'questões' : 'questions'}</option>
                      <option value={3}>3 {language === 'pt-BR' ? 'questões (Recomendado)' : 'questions (Recommended)'}</option>
                      <option value={4}>4 {language === 'pt-BR' ? 'questões' : 'questions'}</option>
                      <option value={5}>5 {language === 'pt-BR' ? 'questões' : 'questions'}</option>
                    </select>
                    <div className="mt-2 text-sm" style={{ color: themeConfig.colors.textMuted }}>
                      {language === 'pt-BR' 
                        ? 'Número de questões carregadas antecipadamente em segundo plano para uma experiência mais fluida. Valores maiores usam mais tokens da API.'
                        : 'Number of questions loaded ahead in the background for a smoother experience. Higher values use more API tokens.'
                      }
                    </div>
                  </div>
                </div>

                <div 
                  className="border rounded-lg p-4 mt-6"
                  style={{ 
                    backgroundColor: themeConfig.colors.info + '10',
                    borderColor: themeConfig.colors.info + '30'
                  }}
                >
                  <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.info }}>
                    {t.howToGetApiKey}
                  </h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside" style={{ color: themeConfig.colors.textSecondary }}>
                    <li>
                      {t.openaiPlatform}{' '}
                      <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                        platform.openai.com
                      </a>
                    </li>
                    <li>{t.signInOrCreate}</li>
                    <li>{t.createSecretKey}</li>
                    <li>{t.copyPasteKey}</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {t.customizeAppearance}
                </h3>
                
                <div className="space-y-6">
                  {/* Current Theme Display */}
                  <div 
                    className="border rounded-lg p-4"
                    style={{ 
                      backgroundColor: themeConfig.colors.surface,
                      borderColor: themeConfig.colors.border 
                    }}
                  >
                    <h4 className="font-medium mb-3" style={{ color: themeConfig.colors.text }}>
                      {t.selectTheme}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: themeConfig.colors.text }}>
                          {themeConfig.name}
                        </p>
                        <p className="text-sm" style={{ color: themeConfig.colors.textMuted }}>
                          {themeConfig.description}
                        </p>
                      </div>
                      <ThemeSelector showLabel={false} />
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div 
                    className="border rounded-lg p-6"
                    style={{ 
                      background: themeConfig.gradients.card,
                      borderColor: themeConfig.colors.border 
                    }}
                  >
                    <h4 className="font-medium mb-4" style={{ color: themeConfig.colors.text }}>
                      Theme Preview
                    </h4>
                    
                    {/* Sample UI Elements */}
                    <div className="space-y-4">
                      {/* Sample Button */}
                      <button 
                        className="px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ 
                          backgroundColor: themeConfig.colors.primary,
                          color: '#ffffff'
                        }}
                      >
                        Sample Button
                      </button>
                      
                      {/* Sample Card */}
                      <div 
                        className="p-4 rounded-lg border"
                        style={{ 
                          backgroundColor: themeConfig.colors.surface,
                          borderColor: themeConfig.colors.border 
                        }}
                      >
                        <h5 className="font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                          Sample Card
                        </h5>
                        <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                          This is how content will look in the selected theme.
                        </p>
                      </div>
                      
                      {/* Color Palette */}
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                          Color Palette
                        </p>
                        <div className="flex space-x-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.primary }}
                            title="Primary"
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.secondary }}
                            title="Secondary"
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.accent }}
                            title="Accent"
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.success }}
                            title="Success"
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.warning }}
                            title="Warning"
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.error }}
                            title="Error"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                {t.selectLanguage}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleLanguageChange('en-US')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    language === 'en-US'
                      ? 'shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    borderColor: language === 'en-US' ? themeConfig.colors.primary : themeConfig.colors.border,
                    backgroundColor: language === 'en-US' ? themeConfig.colors.primary + '10' : themeConfig.colors.surface,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div className="text-left">
                      <h4 className="font-medium" style={{ color: themeConfig.colors.text }}>
                        English (US)
                      </h4>
                      <p className="text-sm" style={{ color: themeConfig.colors.textMuted }}>
                        United States
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleLanguageChange('pt-BR')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    language === 'pt-BR'
                      ? 'shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    borderColor: language === 'pt-BR' ? themeConfig.colors.primary : themeConfig.colors.border,
                    backgroundColor: language === 'pt-BR' ? themeConfig.colors.primary + '10' : themeConfig.colors.surface,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🇧🇷</span>
                    <div className="text-left">
                      <h4 className="font-medium" style={{ color: themeConfig.colors.text }}>
                        Português (Brasil)
                      </h4>
                      <p className="text-sm" style={{ color: themeConfig.colors.textMuted }}>
                        Brasil
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {t.dataManagement}
                </h3>
                <p className="mb-6" style={{ color: themeConfig.colors.textSecondary }}>
                  {t.manageYourData}
                </p>
                
                <div 
                  className="border rounded-lg p-6"
                  style={{ 
                    backgroundColor: themeConfig.colors.error + '10',
                    borderColor: themeConfig.colors.error + '30'
                  }}
                >
                  <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.error }}>
                    {t.deleteAllData}
                  </h4>
                  <p className="text-sm mb-4" style={{ color: themeConfig.colors.textSecondary }}>
                    {t.deleteAllDataDesc}
                  </p>
                  <button
                    onClick={deleteAllData}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: themeConfig.colors.error,
                      color: '#ffffff'
                    }}
                  >
                    {t.deleteAllData}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {activeTab === 'api' && (
        <div className="text-center">
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            style={{
              backgroundColor: themeConfig.colors.primary,
              color: '#ffffff',
            }}
          >
            <Save className="w-5 h-5" />
            <span>{showSaved ? t.saved : t.saveSettings}</span>
          </button>
        </div>
      )}

      {/* Language Switch Modal */}
      <LanguageSwitchModal
        isOpen={showLanguageModal}
        onClose={() => {
          setShowLanguageModal(false);
          setPendingLanguage(null);
        }}
        onConfirm={handleLanguageModalConfirm}
        currentLanguage={language}
        newLanguage={pendingLanguage || language}
      />
    </div>
  );
}