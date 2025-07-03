import React, { useState, useEffect } from 'react';
import { Save, Key, Bot, Globe, Info, Trash2, RefreshCw, BookOpen, Brain, Lightbulb, Settings as SettingsIcon } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { Language, LearningSettings, LearningTechniquesPreference } from '../types';
import LanguageSwitchModal from './LanguageSwitchModal';

const DEFAULT_PROMPTS = {
  multipleChoice: '',
  dissertative: '',
  evaluation: '',
  elaborativePrompt: '',
  retrievalPrompt: ''
};

const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  spacedRepetition: true,
  interleaving: true,
  elaborativeInterrogation: true,
  selfExplanation: true,
  desirableDifficulties: true,
  retrievalPractice: true,
  generationEffect: true
};

const DEFAULT_LEARNING_PREFERENCE: LearningTechniquesPreference = {
  rememberChoice: false,
  defaultSettings: DEFAULT_LEARNING_SETTINGS
};

export default function Settings() {
  const { t, language, changeLanguage, languageSwitchPreference, updateLanguageSwitchPreference, resetLanguageSwitchPreference } = useLanguage();
  const [apiSettings, setApiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: DEFAULT_PROMPTS
  });
  const [learningPreference, setLearningPreference] = useLocalStorage<LearningTechniquesPreference>('studorama-learning-preference', DEFAULT_LEARNING_PREFERENCE);
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'prompts' | 'learning' | 'language' | 'about'>('api');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const handleSave = () => {
    setApiSettings(apiSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const resetPrompts = () => {
    setApiSettings(prev => ({
      ...prev,
      customPrompts: DEFAULT_PROMPTS
    }));
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

  const updateLearningSettings = (newSettings: Partial<LearningSettings>) => {
    setLearningPreference(prev => ({
      ...prev,
      defaultSettings: { ...prev.defaultSettings, ...newSettings }
    }));
  };

  const toggleRememberChoice = () => {
    setLearningPreference(prev => ({
      ...prev,
      rememberChoice: !prev.rememberChoice
    }));
  };

  const unsetRememberChoice = () => {
    setLearningPreference(prev => ({
      ...prev,
      rememberChoice: false
    }));
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

  const getLearningTechniqueLabel = (key: string): string => {
    const labels: Record<string, { en: string; pt: string }> = {
      spacedRepetition: { en: 'Spaced Repetition', pt: 'Repetição Espaçada' },
      interleaving: { en: 'Interleaving', pt: 'Intercalação' },
      elaborativeInterrogation: { en: 'Elaborative Interrogation', pt: 'Interrogação Elaborativa' },
      selfExplanation: { en: 'Self Explanation', pt: 'Auto-Explicação' },
      desirableDifficulties: { en: 'Desirable Difficulties', pt: 'Dificuldades Desejáveis' },
      retrievalPractice: { en: 'Retrieval Practice', pt: 'Prática de Recuperação' },
      generationEffect: { en: 'Generation Effect', pt: 'Efeito de Geração' }
    };

    const label = labels[key];
    if (!label) return key;
    
    return language === 'pt-BR' ? label.pt : label.en;
  };

  const tabs = [
    { id: 'api' as const, label: t.apiConfiguration, icon: Key },
    { id: 'prompts' as const, label: t.aiPrompts, icon: Bot },
    { id: 'learning' as const, label: t.learningTechniquesTab, icon: Brain },
    { id: 'language' as const, label: t.language, icon: Globe },
    { id: 'about' as const, label: t.about, icon: Info },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SettingsIcon className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t.settingsTitle}</h1>
        <p className="text-gray-600">{t.configurePreferences}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-1 p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.openaiApiConfig}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.openaiApiKey}
                    </label>
                    <input
                      type="password"
                      id="apiKey"
                      value={apiSettings.openaiApiKey}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                    <p className="text-sm text-gray-600 mt-2">{t.apiKeyStored}</p>
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.openaiModel}
                    </label>
                    <select
                      id="model"
                      value={apiSettings.model}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    >
                      <option value="gpt-4o">{t.gpt4oRecommended}</option>
                      <option value="gpt-4o-mini">{t.gpt4oMini}</option>
                      <option value="gpt-4-turbo">{t.gpt4Turbo}</option>
                      <option value="gpt-4">{t.gpt4}</option>
                      <option value="gpt-3.5-turbo">{t.gpt35Turbo}</option>
                    </select>
                    <div className="mt-2 text-sm text-gray-600">
                      {apiSettings.model === 'gpt-4o' && t.latestMostCapable}
                      {apiSettings.model === 'gpt-4o-mini' && t.fasterCostEffective}
                      {apiSettings.model === 'gpt-4-turbo' && t.highPerformance}
                      {apiSettings.model === 'gpt-4' && t.previousGeneration}
                      {apiSettings.model === 'gpt-3.5-turbo' && t.fastEconomical}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-blue-900 mb-2">{t.howToGetApiKey}</h4>
                  <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
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

                {/* Configuration Status */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">{t.configurationStatus}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t.openaiApiKey}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        apiSettings.openaiApiKey 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiSettings.openaiApiKey ? t.configured : t.notConfigured}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t.selectedModel}</span>
                      <span className="text-sm font-medium text-gray-900">{apiSettings.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t.enhancedStudyMode}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        apiSettings.openaiApiKey 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {apiSettings.openaiApiKey ? t.ready : t.requiresApiKey}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t.aiPromptsCustomization}</h3>
                <button
                  onClick={resetPrompts}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.resetToDefaults}</span>
                </button>
              </div>
              
              <p className="text-gray-600">{t.customizeGeneration}</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.multipleChoicePrompt}
                  </label>
                  <textarea
                    value={apiSettings.customPrompts.multipleChoice}
                    onChange={(e) => setApiSettings(prev => ({
                      ...prev,
                      customPrompts: { ...prev.customPrompts, multipleChoice: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    placeholder={language === 'pt-BR' ? 'Deixe em branco para usar o prompt padrão...' : 'Leave blank to use default prompt...'}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.subjectPlaceholder2}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dissertativePrompt}
                  </label>
                  <textarea
                    value={apiSettings.customPrompts.dissertative}
                    onChange={(e) => setApiSettings(prev => ({
                      ...prev,
                      customPrompts: { ...prev.customPrompts, dissertative: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    placeholder={language === 'pt-BR' ? 'Deixe em branco para usar o prompt padrão...' : 'Leave blank to use default prompt...'}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.subjectPlaceholder2}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.answerEvaluationPrompt}
                  </label>
                  <textarea
                    value={apiSettings.customPrompts.evaluation}
                    onChange={(e) => setApiSettings(prev => ({
                      ...prev,
                      customPrompts: { ...prev.customPrompts, evaluation: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    placeholder={language === 'pt-BR' ? 'Deixe em branco para usar o prompt padrão...' : 'Leave blank to use default prompt...'}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.questionPlaceholder}{t.userAnswerPlaceholder}{t.modelAnswerPlaceholder}</p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Techniques Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.learningTechniquesSettings}</h3>
              <p className="text-gray-600">{t.manageLearningTechniques}</p>

              {/* Default Learning Techniques */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-blue-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  {t.defaultLearningTechniques}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(learningPreference.defaultSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateLearningSettings({ [key]: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-blue-800">
                        {getLearningTechniqueLabel(key)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remember Choice Setting */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900">
                    {t.rememberChoiceForSessions}
                  </h4>
                  <button
                    onClick={toggleRememberChoice}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      learningPreference.rememberChoice ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        learningPreference.rememberChoice ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {t.rememberChoiceDescription}
                </p>
                {learningPreference.rememberChoice && (
                  <button
                    onClick={unsetRememberChoice}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    {t.unsetRememberChoice}
                  </button>
                )}
              </div>

              {/* Learning Science Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-green-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t.makeItStickScience}
                </h4>
                <div className="space-y-4 text-sm text-green-800">
                  <div>
                    <h5 className="font-medium">{t.spacedRepetition}</h5>
                    <p>{t.spacedRepetitionFull}</p>
                    <p className="text-xs mt-1 italic">{t.spacedRepetitionHow}</p>
                  </div>
                  <div>
                    <h5 className="font-medium">{t.interleaving}</h5>
                    <p>{t.interleavingFull}</p>
                    <p className="text-xs mt-1 italic">{t.interleavingHow}</p>
                  </div>
                  <div>
                    <h5 className="font-medium">{t.elaborativeInterrogation}</h5>
                    <p>{t.elaborativeInterrogationFull}</p>
                    <p className="text-xs mt-1 italic">{t.elaborativeInterrogationHow}</p>
                  </div>
                  <div>
                    <h5 className="font-medium">{t.retrievalPractice}</h5>
                    <p>{t.retrievalPracticeFull}</p>
                    <p className="text-xs mt-1 italic">{t.retrievalPracticeHow}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-green-200">
                  <h5 className="font-medium text-green-900 mb-2">{t.researchBasedBenefits}</h5>
                  <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                    <li>{t.improvedRetention}</li>
                    <li>{t.betterTransfer}</li>
                    <li>{t.deeperUnderstanding}</li>
                    <li>{t.metacognitiveAwareness}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t.selectLanguage}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleLanguageChange('en-US')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    language === 'en-US'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">English (US)</h4>
                      <p className="text-sm text-gray-600">United States</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleLanguageChange('pt-BR')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    language === 'pt-BR'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🇧🇷</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Português (Brasil)</h4>
                      <p className="text-sm text-gray-600">Brasil</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Language Switch Preferences */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  {t.languageSwitchPreferences}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t.manageLanguagePreferences}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t.rememberChoice}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      languageSwitchPreference.rememberChoice 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {languageSwitchPreference.rememberChoice ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t.resetPromptsOption}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      languageSwitchPreference.autoResetPrompts 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {languageSwitchPreference.autoResetPrompts ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={resetLanguageSwitchPreference}
                  className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {t.resetLanguagePreferences}
                </button>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.aboutStudorama}</h3>
                <p className="text-gray-600">{t.aiPoweredPlatform}</p>
                <p className="text-sm text-gray-500 mt-2">{t.createdBy}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-orange-800 leading-relaxed">
                  {t.studoramaDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Features */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">{t.coreFeatures}</h4>
                  <ul className="text-blue-800 text-sm space-y-2 list-disc list-inside">
                    <li>{t.aiGeneratedQuestions}</li>
                    <li>{t.mixedQuestionTypes}</li>
                    <li>{t.spacedRepetitionScheduling}</li>
                    <li>{t.elaborativePrompts}</li>
                    <li>{t.selfExplanationExercises}</li>
                    <li>{t.confidenceTracking}</li>
                    <li>{t.sessionHistoryAnalytics}</li>
                  </ul>
                </div>

                {/* Learning Science */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4">{t.learningScience}</h4>
                  <ul className="text-green-800 text-sm space-y-2 list-disc list-inside">
                    <li>{t.makeItStickResearch}</li>
                    <li>{t.retrievalPracticeImplementation}</li>
                    <li>{t.desirableDifficultiesIntegration}</li>
                    <li>{t.generationEffectUtilization}</li>
                    <li>{t.metacognitiveStrategyTraining}</li>
                    <li>{t.evidenceBasedSpacing}</li>
                    <li>{t.cognitiveLoadOptimization}</li>
                  </ul>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h4 className="font-semibold text-purple-900 mb-3">{t.privacySecurity}</h4>
                <p className="text-purple-800 text-sm leading-relaxed">
                  {t.privacyDescription}
                </p>
              </div>

              {/* Scientific Foundation */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h4 className="font-semibold text-indigo-900 mb-3">{t.scientificFoundation}</h4>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  {t.scientificDescription}
                </p>
              </div>

              {/* Open Source */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t.openSourceProject}</h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {t.openSourceDescription}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/oluiscabral/studorama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <span>{t.viewOnGitHub}</span>
                  </a>
                  <a
                    href="https://github.com/oluiscabral/studorama/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <span>{t.reportIssue}</span>
                  </a>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">{t.dataManagement}</h4>
                    <p className="text-sm text-red-700">{t.manageYourData}</p>
                  </div>
                </div>

                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 mb-2">{t.deleteAllData}</h5>
                  <p className="text-sm text-red-700 mb-4">
                    {t.deleteAllDataDesc}
                  </p>
                  <button
                    onClick={deleteAllData}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.deleteAllData}</span>
                  </button>
                </div>
              </div>

              {/* Links */}
              <div className="text-center">
                <div className="flex justify-center space-x-6">
                  <a
                    href="https://github.com/oluiscabral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {t.github}
                  </a>
                  <a
                    href="https://linkedin.com/in/oluiscabral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {t.linkedin}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {(activeTab === 'api' || activeTab === 'prompts') && (
        <div className="text-center">
          <button
            onClick={handleSave}
            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 mx-auto"
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