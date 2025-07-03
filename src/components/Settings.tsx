import { Clock, Copy, Globe, Info, Key, Palette, RefreshCw, Save, Settings as SettingsIcon, Share, Timer, Trash2, Vibrate, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { forceMigration, getVersionInfo } from '../core/services/version/versionControl';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import { Language, TimerPreferences } from '../types';
import ThemeSelector from './ThemeSelector';

const DEFAULT_PROMPTS = {
  multipleChoice: '',
  dissertative: '',
  evaluation: '',
  elaborativePrompt: '',
  retrievalPrompt: ''
};

const DEFAULT_TIMER_PREFERENCES: TimerPreferences = {
  rememberChoice: false,
  defaultSessionTimerEnabled: false,
  defaultSessionTimer: 30,
  defaultQuestionTimerEnabled: false,
  defaultQuestionTimer: 60,
  defaultAccumulateTime: false,
  defaultShowWarnings: true,
  defaultAutoSubmit: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export default function Settings() {
  const { t, language, changeLanguage } = useLanguage();
  const { currentTheme, themeConfig } = useTheme();
  const [apiSettings, setApiSettings] = useLocalStorage('studorama-api-settings', { 
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: DEFAULT_PROMPTS,
    preloadQuestions: 3 // Default to 3 questions ahead
  });
  const [timerPreferences, setTimerPreferences] = useLocalStorage<TimerPreferences>('studorama-timer-preferences', DEFAULT_TIMER_PREFERENCES);
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'appearance' | 'language' | 'timers' | 'sharing' | 'data' | 'version'>('api');
  const [shareableUrl, setShareableUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-save timer preferences
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimerPreferences(timerPreferences);
    }, 500); // Auto-save after 500ms of no changes

    return () => clearTimeout(timeoutId);
  }, [timerPreferences, setTimerPreferences]);

  const handleSave = () => {
    setApiSettings(apiSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return;
    changeLanguage(newLanguage);
  };

  const updateTimerPreference = <K extends keyof TimerPreferences>(key: K, value: TimerPreferences[K]) => {
    setTimerPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetTimerPreferences = () => {
    setTimerPreferences(DEFAULT_TIMER_PREFERENCES);
  };

  const generateShareableUrl = () => {
    if (!apiSettings.openaiApiKey) return;

    const baseUrl = window.location.origin;
    const url = new URL(baseUrl);
    url.searchParams.set("apikey", apiSettings.openaiApiKey);
    if (apiSettings.model && apiSettings.model !== "gpt-4o-mini") {
      url.searchParams.set("model", apiSettings.model);
    }

    setShareableUrl(url.toString());
  };

  const copyShareableUrl = async () => {
    if (!shareableUrl) return;

    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
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

  // Get version information
  const versionInfo = getVersionInfo();

  const tabs = [
    { id: "api" as const, label: t.apiConfiguration, icon: Key },
    { id: "timers" as const, label: language === "pt-BR" ? "Timers" : "Timers", icon: Timer },
    { id: "appearance" as const, label: t.appearance, icon: Palette },
    { id: "language" as const, label: t.language, icon: Globe },
    { id: "sharing" as const, label: language === "pt-BR" ? "Compartilhamento" : "Sharing", icon: Share },
    { id: "data" as const, label: t.dataManagement, icon: Trash2 },
    { id: "version" as const, label: language === "pt-BR" ? "Versão" : "Version", icon: Info },
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
          <nav className="flex space-x-1 p-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-white'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === id ? themeConfig.colors.primary : 'transparent',
                  color: activeTab === id ? '#ffffff' : themeConfig.colors.textSecondary,
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
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

          {/* Timer Settings Tab */}
          {activeTab === 'timers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Configurações de Timer' : 'Timer Settings'}
                </h3>
                <button
                  onClick={resetTimerPreferences}
                  className="text-sm px-3 py-1 rounded-lg transition-colors"
                  style={{
                    backgroundColor: themeConfig.colors.textMuted + '20',
                    color: themeConfig.colors.textMuted
                  }}
                >
                  {language === 'pt-BR' ? 'Restaurar Padrões' : 'Reset Defaults'}
                </button>
              </div>

              {/* Remember Choice */}
              <div 
                className="border rounded-lg p-4"
                style={{
                  backgroundColor: themeConfig.colors.info + '10',
                  borderColor: themeConfig.colors.info + '30'
                }}
              >
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timerPreferences.rememberChoice}
                    onChange={(e) => updateTimerPreference('rememberChoice', e.target.checked)}
                    className="w-4 h-4 rounded focus:ring-2 mt-0.5 flex-shrink-0"
                    style={{
                      accentColor: themeConfig.colors.info,
                      '--tw-ring-color': themeConfig.colors.info,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' ? 'Lembrar minhas configurações de timer' : 'Remember my timer settings'}
                    </div>
                    <div className="text-xs mt-1 leading-relaxed" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' 
                        ? 'Usar essas configurações como padrão ao criar novas sessões de estudo'
                        : 'Use these settings as defaults when creating new study sessions'
                      }
                    </div>
                  </div>
                </label>
              </div>

              {/* Session Timer */}
              <div 
                className="border rounded-lg p-4 sm:p-6"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5" style={{ color: themeConfig.colors.info }} />
                  <h4 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Timer da Sessão' : 'Session Timer'}
                  </h4>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={timerPreferences.defaultSessionTimerEnabled}
                      onChange={(e) => updateTimerPreference('defaultSessionTimerEnabled', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                      {language === 'pt-BR' ? 'Habilitar timer da sessão por padrão' : 'Enable session timer by default'}
                    </span>
                  </label>
                  
                  {timerPreferences.defaultSessionTimerEnabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Duração padrão da sessão (minutos)' : 'Default session duration (minutes)'}
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="5"
                          max="240"
                          step="5"
                          value={timerPreferences.defaultSessionTimer}
                          onChange={(e) => updateTimerPreference('defaultSessionTimer', parseInt(e.target.value))}
                          className="flex-1"
                          style={{ accentColor: themeConfig.colors.primary }}
                        />
                        <span 
                          className="text-sm font-medium px-3 py-1 rounded-lg min-w-[60px] text-center"
                          style={{
                            backgroundColor: themeConfig.colors.primary + '20',
                            color: themeConfig.colors.primary
                          }}
                        >
                          {timerPreferences.defaultSessionTimer}m
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Timer */}
              <div 
                className="border rounded-lg p-4 sm:p-6"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Timer className="w-5 h-5" style={{ color: themeConfig.colors.warning }} />
                  <h4 className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                    {language === 'pt-BR' ? 'Timer por Questão' : 'Question Timer'}
                  </h4>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={timerPreferences.defaultQuestionTimerEnabled}
                      onChange={(e) => updateTimerPreference('defaultQuestionTimerEnabled', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                      {language === 'pt-BR' ? 'Habilitar timer por questão por padrão' : 'Enable question timer by default'}
                    </span>
                  </label>
                  
                  {timerPreferences.defaultQuestionTimerEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                          {language === 'pt-BR' ? 'Tempo padrão por questão (segundos)' : 'Default time per question (seconds)'}
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="15"
                            max="300"
                            step="15"
                            value={timerPreferences.defaultQuestionTimer}
                            onChange={(e) => updateTimerPreference('defaultQuestionTimer', parseInt(e.target.value))}
                            className="flex-1"
                            style={{ accentColor: themeConfig.colors.primary }}
                          />
                          <span 
                            className="text-sm font-medium px-3 py-1 rounded-lg min-w-[60px] text-center"
                            style={{
                              backgroundColor: themeConfig.colors.warning + '20',
                              color: themeConfig.colors.warning
                            }}
                          >
                            {timerPreferences.defaultQuestionTimer}s
                          </span>
                        </div>
                      </div>
                      
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={timerPreferences.defaultAccumulateTime}
                          onChange={(e) => updateTimerPreference('defaultAccumulateTime', e.target.checked)}
                          className="w-4 h-4 rounded focus:ring-2 mt-0.5"
                          style={{
                            accentColor: themeConfig.colors.primary,
                            '--tw-ring-color': themeConfig.colors.primary,
                          }}
                        />
                        <div>
                          <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                            {language === 'pt-BR' ? 'Acumular tempo entre questões' : 'Accumulate time between questions'}
                          </span>
                          <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                            {language === 'pt-BR' 
                              ? 'O tempo não utilizado em uma questão será adicionado à próxima'
                              : 'Unused time from one question will be added to the next'
                            }
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Timer Behavior */}
              <div 
                className="border rounded-lg p-4 sm:p-6"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border
                }}
              >
                <h4 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Comportamento do Timer' : 'Timer Behavior'}
                </h4>
                
                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={timerPreferences.defaultShowWarnings}
                      onChange={(e) => updateTimerPreference('defaultShowWarnings', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2 mt-0.5"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <div>
                      <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Mostrar avisos de tempo' : 'Show timer warnings'}
                      </span>
                      <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                        {language === 'pt-BR' 
                          ? 'Exibir avisos quando o tempo estiver acabando'
                          : 'Display warnings when time is running out'
                        }
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={timerPreferences.defaultAutoSubmit}
                      onChange={(e) => updateTimerPreference('defaultAutoSubmit', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2 mt-0.5"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <div>
                      <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Enviar automaticamente quando o tempo acabar' : 'Auto-submit when time runs out'}
                      </span>
                      <p className="text-sm mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                        {language === 'pt-BR' 
                          ? 'Enviar a resposta automaticamente quando o timer da questão expirar'
                          : 'Automatically submit the answer when the question timer expires'
                        }
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Audio & Haptic Feedback */}
              <div 
                className="border rounded-lg p-4 sm:p-6"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border
                }}
              >
                <h4 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Feedback Sensorial' : 'Sensory Feedback'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={timerPreferences.soundEnabled}
                      onChange={(e) => updateTimerPreference('soundEnabled', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <Volume2 className="w-4 h-4" style={{ color: themeConfig.colors.success }} />
                    <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                      {language === 'pt-BR' ? 'Sons habilitados' : 'Sound enabled'}
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={timerPreferences.vibrationEnabled}
                      onChange={(e) => updateTimerPreference('vibrationEnabled', e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2"
                      style={{
                        accentColor: themeConfig.colors.primary,
                        '--tw-ring-color': themeConfig.colors.primary,
                      }}
                    />
                    <Vibrate className="w-4 h-4" style={{ color: themeConfig.colors.accent }} />
                    <span className="font-medium" style={{ color: themeConfig.colors.text }}>
                      {language === 'pt-BR' ? 'Vibração habilitada' : 'Vibration enabled'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Auto-save indicator */}
              <div 
                className="border rounded-lg p-3 text-center"
                style={{
                  backgroundColor: themeConfig.colors.success + '10',
                  borderColor: themeConfig.colors.success + '30'
                }}
              >
                <p className="text-sm" style={{ color: themeConfig.colors.success }}>
                  ✓ {language === 'pt-BR' ? 'Configurações salvas automaticamente' : 'Settings auto-saved'}
                </p>
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
                          {language === 'pt-BR' ? 
                            (currentTheme === 'light' ? 'Claro' : 
                             currentTheme === 'dark' ? 'Escuro' : 
                             currentTheme === 'focus' ? 'Modo Foco' : 
                             currentTheme === 'midnight' ? 'Meia-noite' : 
                             currentTheme === 'forest' ? 'Floresta' : 
                             currentTheme === 'ocean' ? 'Oceano' : 
                             currentTheme === 'sunset' ? 'Pôr do Sol' : 
                             currentTheme === 'neon' ? 'Neon' : 
                             currentTheme === 'minimal' ? 'Minimalista' : 
                             currentTheme === 'warm' ? 'Quente' : themeConfig.name) 
                            : themeConfig.name}
                        </p>
                        <p className="text-sm" style={{ color: themeConfig.colors.textMuted }}>
                          {language === 'pt-BR' ? 
                            (currentTheme === 'light' ? 'Limpo e brilhante para estudar durante o dia' : 
                             currentTheme === 'dark' ? 'Suave para os olhos para estudar à noite' : 
                             currentTheme === 'focus' ? 'Distrações mínimas para concentração profunda' : 
                             currentTheme === 'midnight' ? 'Tema azul profundo para sessões de estudo noturnas' : 
                             currentTheme === 'forest' ? 'Tema verde natural para aprendizado calmo e focado' : 
                             currentTheme === 'ocean' ? 'Tema azul calmante inspirado no oceano' : 
                             currentTheme === 'sunset' ? 'Tema laranja e rosa quente para sessões de estudo energizantes' : 
                             currentTheme === 'neon' ? 'Tema cyberpunk de alta energia para sessões de estudo intensas' : 
                             currentTheme === 'minimal' ? 'Design ultra-limpo para aprendizado sem distrações' : 
                             currentTheme === 'warm' ? 'Tema aconchegante e confortável para estudar relaxado' : themeConfig.description) 
                            : themeConfig.description}
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
                      {language === 'pt-BR' ? 'Prévia do Tema' : 'Theme Preview'}
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
                        {language === 'pt-BR' ? 'Botão de Exemplo' : 'Sample Button'}
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
                          {language === 'pt-BR' ? 'Cartão de Exemplo' : 'Sample Card'}
                        </h5>
                        <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                          {language === 'pt-BR' 
                            ? 'É assim que o conteúdo aparecerá no tema selecionado.'
                            : 'This is how content will look in the selected theme.'
                          }
                        </p>
                      </div>
                      
                      {/* Color Palette */}
                      <div>
                        <p className="text-sm font-medium mb-2" style={{ color: themeConfig.colors.text }}>
                          {language === 'pt-BR' ? 'Paleta de Cores' : 'Color Palette'}
                        </p>
                        <div className="flex space-x-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.primary }}
                            title={language === 'pt-BR' ? 'Primária' : 'Primary'}
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.secondary }}
                            title={language === 'pt-BR' ? 'Secundária' : 'Secondary'}
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.accent }}
                            title={language === 'pt-BR' ? 'Destaque' : 'Accent'}
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.success }}
                            title={language === 'pt-BR' ? 'Sucesso' : 'Success'}
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.warning }}
                            title={language === 'pt-BR' ? 'Aviso' : 'Warning'}
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: themeConfig.colors.error }}
                            title={language === 'pt-BR' ? 'Erro' : 'Error'}
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

          {/* Sharing Tab */}
          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Compartilhamento de API' : 'API Sharing'}
                </h3>
                <p className="mb-6" style={{ color: themeConfig.colors.textSecondary }}>
                  {language === 'pt-BR' 
                    ? 'Gere um link que configura automaticamente a chave da API para outros usuários.'
                    : 'Generate a link that automatically configures the API key for other users.'
                  }
                </p>
                
                {apiSettings.openaiApiKey ? (
                  <div className="space-y-4">
                    <button
                      onClick={generateShareableUrl}
                      className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: '#ffffff'
                      }}
                    >
                      <Share className="w-4 h-4" />
                      <span>
                        {language === 'pt-BR' ? 'Gerar Link Compartilhável' : 'Generate Shareable Link'}
                      </span>
                    </button>
                    
                    {shareableUrl && (
                      <div 
                        className="border rounded-lg p-4"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium" style={{ color: themeConfig.colors.text }}>
                            {language === 'pt-BR' ? 'Link Compartilhável' : 'Shareable Link'}
                          </h4>
                          <button
                            onClick={copyShareableUrl}
                            className="px-3 py-1 text-sm rounded-lg transition-colors flex items-center space-x-1"
                            style={{
                              backgroundColor: copySuccess ? themeConfig.colors.success : themeConfig.colors.primary,
                              color: '#ffffff'
                            }}
                          >
                            <Copy className="w-3 h-3" />
                            <span>
                              {copySuccess 
                                ? (language === 'pt-BR' ? 'Copiado!' : 'Copied!') 
                                : (language === 'pt-BR' ? 'Copiar' : 'Copy')
                              }
                            </span>
                          </button>
                        </div>
                        <div 
                          className="p-3 rounded border text-sm font-mono break-all"
                          style={{
                            backgroundColor: themeConfig.colors.surface,
                            borderColor: themeConfig.colors.border,
                            color: themeConfig.colors.text
                          }}
                        >
                          {shareableUrl}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className="border rounded-lg p-4"
                    style={{
                      backgroundColor: themeConfig.colors.warning + '10',
                      borderColor: themeConfig.colors.warning + '30'
                    }}
                  >
                    <p style={{ color: themeConfig.colors.warning }}>
                      {language === 'pt-BR' 
                        ? 'Configure sua chave da API primeiro para gerar links compartilháveis.'
                        : 'Configure your API key first to generate shareable links.'
                      }
                    </p>
                  </div>
                )}
                
                <div 
                  className="border rounded-lg p-4 mt-4"
                  style={{
                    backgroundColor: themeConfig.colors.error + '10',
                    borderColor: themeConfig.colors.error + '30'
                  }}
                >
                  <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.error }}>
                    ⚠️ {language === 'pt-BR' ? 'Aviso de Segurança' : 'Security Warning'}
                  </h4>
                  <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: themeConfig.colors.error }}>
                    <li>
                      {language === 'pt-BR' 
                        ? 'Compartilhe apenas com pessoas confiáveis'
                        : 'Only share with trusted individuals'
                      }
                    </li>
                    <li>
                      {language === 'pt-BR' 
                        ? 'A chave da API dá acesso à sua conta OpenAI'
                        : 'The API key provides access to your OpenAI account'
                      }
                    </li>
                    <li>
                      {language === 'pt-BR' 
                        ? 'Monitore o uso da sua API no painel da OpenAI'
                        : 'Monitor your API usage in the OpenAI dashboard'
                      }
                    </li>
                  </ul>
                </div>
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

          {/* Version Tab */}
          {activeTab === 'version' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Informações da Versão' : 'Version Information'}
                </h3>
                
                <div className="space-y-4">
                  {/* Current Version */}
                  <div 
                    className="border rounded-lg p-4"
                    style={{
                      backgroundColor: themeConfig.colors.surface,
                      borderColor: themeConfig.colors.border
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium" style={{ color: themeConfig.colors.text }}>
                          {language === 'pt-BR' ? 'Versão Atual' : 'Current Version'}
                        </h4>
                        <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                          {language === 'pt-BR' ? 'Versão do aplicativo em execução' : 'Currently running application version'}
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: themeConfig.colors.primary + '20',
                          color: themeConfig.colors.primary
                        }}
                      >
                        v{versionInfo.currentVersion}
                      </span>
                    </div>
                  </div>

                  {/* Stored Version */}
                  <div 
                    className="border rounded-lg p-4"
                    style={{
                      backgroundColor: themeConfig.colors.surface,
                      borderColor: themeConfig.colors.border
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium" style={{ color: themeConfig.colors.text }}>
                          {language === 'pt-BR' ? 'Versão Armazenada' : 'Stored Version'}
                        </h4>
                        <p className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                          {language === 'pt-BR' ? 'Última versão conhecida pelo navegador' : 'Last version known by the browser'}
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: versionInfo.storedVersion === versionInfo.currentVersion 
                            ? themeConfig.colors.success + '20' 
                            : themeConfig.colors.warning + '20',
                          color: versionInfo.storedVersion === versionInfo.currentVersion 
                            ? themeConfig.colors.success 
                            : themeConfig.colors.warning
                        }}
                      >
                        {versionInfo.storedVersion ? `v${versionInfo.storedVersion}` : (language === 'pt-BR' ? 'Nenhuma' : 'None')}
                      </span>
                    </div>
                  </div>

                  {/* Version Status */}
                  <div 
                    className="border rounded-lg p-4"
                    style={{
                      backgroundColor: versionInfo.isVersionChanged 
                        ? themeConfig.colors.warning + '10' 
                        : versionInfo.isFreshInstallation 
                        ? themeConfig.colors.info + '10'
                        : themeConfig.colors.success + '10',
                      borderColor: versionInfo.isVersionChanged 
                        ? themeConfig.colors.warning + '30' 
                        : versionInfo.isFreshInstallation 
                        ? themeConfig.colors.info + '30'
                        : themeConfig.colors.success + '30'
                    }}
                  >
                    <h4 className="font-medium mb-2" style={{ 
                      color: versionInfo.isVersionChanged 
                        ? themeConfig.colors.warning 
                        : versionInfo.isFreshInstallation 
                        ? themeConfig.colors.info
                        : themeConfig.colors.success 
                    }}>
                      {versionInfo.isFreshInstallation 
                        ? (language === 'pt-BR' ? '🆕 Instalação Nova' : '🆕 Fresh Installation')
                        : versionInfo.isVersionChanged 
                        ? (language === 'pt-BR' ? '🔄 Versão Atualizada' : '🔄 Version Updated')
                        : (language === 'pt-BR' ? '✅ Versão Atual' : '✅ Up to Date')
                      }
                    </h4>
                    <p className="text-sm" style={{ 
                      color: versionInfo.isVersionChanged 
                        ? themeConfig.colors.warning 
                        : versionInfo.isFreshInstallation 
                        ? themeConfig.colors.info
                        : themeConfig.colors.success 
                    }}>
                      {versionInfo.isFreshInstallation 
                        ? (language === 'pt-BR' 
                          ? 'Esta é uma nova instalação do Studorama.'
                          : 'This is a fresh installation of Studorama.')
                        : versionInfo.isVersionChanged 
                        ? (language === 'pt-BR' 
                          ? 'A versão foi atualizada. Dados foram limpos automaticamente (exceto chave da API).'
                          : 'Version was updated. Data was automatically cleared (except API key).')
                        : (language === 'pt-BR' 
                          ? 'Você está executando a versão mais recente.'
                          : 'You are running the latest version.')
                      }
                    </p>
                  </div>

                  {/* Data Preservation Info */}
                  <div 
                    className="border rounded-lg p-4"
                    style={{
                      backgroundColor: themeConfig.colors.info + '10',
                      borderColor: themeConfig.colors.info + '30'
                    }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.info }}>
                      🔒 {language === 'pt-BR' ? 'Dados Preservados' : 'Preserved Data'}
                    </h4>
                    <p className="text-sm mb-2" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' 
                        ? 'Os seguintes dados são preservados durante atualizações de versão:'
                        : 'The following data is preserved during version updates:'
                      }
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: themeConfig.colors.info }}>
                      {versionInfo.preservedKeys.map((key) => (
                        <li key={key}>
                          {key === 'studorama-api-settings' 
                            ? (language === 'pt-BR' ? 'Configurações da API (chave, modelo, etc.)' : 'API Settings (key, model, etc.)')
                            : key === 'studorama-app-version'
                            ? (language === 'pt-BR' ? 'Informações da versão' : 'Version information')
                            : key
                          }
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Debug Actions */}
                  {process.env.NODE_ENV === 'development' && (
                    <div 
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: themeConfig.colors.textMuted + '10',
                        borderColor: themeConfig.colors.textMuted + '30'
                      }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: themeConfig.colors.textMuted }}>
                        🔧 {language === 'pt-BR' ? 'Ações de Debug' : 'Debug Actions'}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: themeConfig.colors.textMuted }}>
                        {language === 'pt-BR' 
                          ? 'Disponível apenas em modo de desenvolvimento'
                          : 'Available only in development mode'
                        }
                      </p>
                      <button
                        onClick={forceMigration}
                        className="px-3 py-1 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: themeConfig.colors.textMuted,
                          color: '#ffffff'
                        }}
                      >
                        {language === 'pt-BR' ? 'Forçar Migração' : 'Force Migration'}
                      </button>
                    </div>
                  )}
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
    </div>
  );
}