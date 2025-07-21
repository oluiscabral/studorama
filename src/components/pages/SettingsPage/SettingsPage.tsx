import {
  AlertCircle,
  Brain,
  Check,
  ChevronRight,
  Cloud,
  Cpu,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Info,
  Monitor,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  Tablet,
  Trash2,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../../../core/config/constants';
import {
  getAllProviders,
  getModel,
  getProviderConfig,
  validateProviderConfig
} from '../../../core/services/ai/providers/registry';
import { Language } from '../../../core/types';
import { AIProvider } from '../../../core/types/ai.types';
import { useLanguage, useLocalStorage, useTheme } from '../../../hooks';

interface MultiProviderSettings {
  currentProvider: AIProvider;
  providers: Record<AIProvider, {
    apiKey: string;
    model: string;
    baseUrl?: string;
    customHeaders?: Record<string, string>;
  }>;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

export default function SettingsPage() {
  const { t, language, changeLanguage } = useLanguage();
  const { themeConfig } = useTheme();
  
  // Multi-provider settings
  const [multiProviderSettings, setMultiProviderSettings] = useLocalStorage<MultiProviderSettings>(
    'studorama-multi-provider-settings',
    {
      currentProvider: 'openai',
      providers: {
        openai: { apiKey: '', model: 'gpt-4o-mini' },
        gemini: { apiKey: '', model: 'gemini-1.5-flash' },
        anthropic: { apiKey: '', model: 'claude-3-haiku-20240307' },
        deepseek: { apiKey: '', model: 'deepseek-chat' },
        ollama: { apiKey: '', model: 'llama3.1:8b', baseUrl: 'http://localhost:11434/v1' },
        browser: { apiKey: '', model: 'browser-ai' },
      }
    }
  );

  // UI state
  const [activeTab, setActiveTab] = useState<'providers' | 'language' | 'data'>('providers');
  const [showApiKey, setShowApiKey] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    orientation: 'portrait'
  });
  const [expandedProvider, setExpandedProvider] = useState<AIProvider | null>('openai');
  const settingsRef = useRef<HTMLDivElement>(null);

  // Get all available providers
  const availableProviders = getAllProviders();
  const currentProviderConfig = getProviderConfig(multiProviderSettings.currentProvider);
  const currentProviderSettings = multiProviderSettings.providers[multiProviderSettings.currentProvider];

  // Validate current provider
  const validation = validateProviderConfig(
    multiProviderSettings.currentProvider,
    currentProviderSettings
  );

  // Detect device type and orientation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let type: DeviceInfo['type'] = 'desktop';
      if (width < 640) {
        type = 'mobile';
      } else if (width < 1024) {
        type = 'tablet';
      }
      
      const orientation: DeviceInfo['orientation'] = width > height ? 'landscape' : 'portrait';
      
      setDeviceInfo({ type, orientation });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProviderChange = (providerId: AIProvider) => {
    setMultiProviderSettings(prev => ({
      ...prev,
      currentProvider: providerId
    }));
  };

  const handleProviderSettingChange = (
    providerId: AIProvider,
    key: keyof MultiProviderSettings['providers'][AIProvider],
    value: string
  ) => {
    setMultiProviderSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...prev.providers[providerId],
          [key]: value
        }
      }
    }));
  };

  const toggleProviderExpansion = (providerId: AIProvider) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
    
    // Scroll to the expanded provider after a short delay
    if (expandedProvider !== providerId) {
      setTimeout(() => {
        const element = document.getElementById(`provider-${providerId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleDeleteAllData = () => {
    if (window.confirm(t.deleteAllDataConfirm)) {
      // Clear all localStorage data
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Reload the page to reset the app
      window.location.reload();
    }
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const getProviderIcon = (providerId: AIProvider) => {
    switch (providerId) {
      case 'openai': return <Cloud className="w-5 h-5" />;
      case 'gemini': return <Zap className="w-5 h-5" />;
      case 'anthropic': return <Shield className="w-5 h-5" />;
      case 'deepseek': return <Brain className="w-5 h-5" />;
      case 'ollama': return <Cpu className="w-5 h-5" />;
      case 'browser': return <Monitor className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getProviderStatusColor = (providerId: AIProvider) => {
    const settings = multiProviderSettings.providers[providerId];
    const config = getProviderConfig(providerId);
    const validation = validateProviderConfig(providerId, settings);
    
    if (!validation.valid) return 'text-red-500';
    if (config.requiresApiKey && !settings.apiKey) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getModelBadge = (providerId: AIProvider, modelId: string) => {
    const model = getModel(providerId, modelId);
    if (!model) return null;

    const badgeColors = {
      free: 'bg-green-100 text-green-800',
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColors[model.costTier]}`}>
        {model.costTier === 'free' ? (language === 'pt-BR' ? 'Gratuito' : 'Free') :
         model.costTier === 'low' ? (language === 'pt-BR' ? 'Baixo' : 'Low') :
         model.costTier === 'medium' ? (language === 'pt-BR' ? 'Médio' : 'Medium') :
         (language === 'pt-BR' ? 'Alto' : 'High')}
      </span>
    );
  };

  return (
    <div 
      className="min-h-screen safe-top safe-bottom" 
      style={{ background: themeConfig.gradients.background }}
      ref={settingsRef}
    >
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 shadow-lg"
            style={{ 
              background: themeConfig.gradients.primary,
              boxShadow: `0 8px 32px ${themeConfig.colors.primary}40`
            }}
          >
            <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: themeConfig.colors.text }}>
            {t.settingsTitle}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
            {t.configurePreferences}
          </p>
        </div>

        {/* Tabs */}
        <div 
          className="flex space-x-1 p-1 rounded-2xl mb-4 sm:mb-6 shadow-sm" 
          style={{ backgroundColor: themeConfig.colors.surface }}
        >
          {[
            { id: 'providers', label: language === 'pt-BR' ? 'IA' : 'AI', icon: Brain },
            { id: 'language', label: language === 'pt-BR' ? 'Idioma' : 'Language', icon: Globe },
            { id: 'data', label: language === 'pt-BR' ? 'Dados' : 'Data', icon: Trash2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === id ? 'text-white shadow-lg' : ''
              }`}
              style={{
                backgroundColor: activeTab === id ? themeConfig.colors.primary : 'transparent',
                color: activeTab === id ? '#ffffff' : themeConfig.colors.textSecondary,
                transform: activeTab === id ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4 sm:space-y-6">
          {activeTab === 'providers' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Current Provider Selection */}
              <div 
                className="rounded-2xl p-4 sm:p-6 shadow-lg border"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  borderColor: themeConfig.colors.border,
                }}
              >
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>
                  {language === 'pt-BR' ? 'Provedor de IA' : 'AI Provider'}
                </h3>
                
                <div className="space-y-2 sm:space-y-3">
                  {availableProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        handleProviderChange(provider.id);
                        toggleProviderExpansion(provider.id);
                      }}
                      id={`provider-${provider.id}`}
                      className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left ${
                        multiProviderSettings.currentProvider === provider.id
                          ? 'shadow-lg transform scale-[1.02]'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        borderColor: multiProviderSettings.currentProvider === provider.id 
                          ? themeConfig.colors.primary 
                          : themeConfig.colors.border,
                        backgroundColor: multiProviderSettings.currentProvider === provider.id
                          ? themeConfig.colors.primary + '10'
                          : themeConfig.colors.background,
                        transform: multiProviderSettings.currentProvider === provider.id ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: themeConfig.colors.primary + '20' }}
                          >
                            {getProviderIcon(provider.id)}
                          </div>
                          <div>
                            <span className="font-semibold text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>
                              {provider.name}
                            </span>
                            {deviceInfo.type !== 'mobile' && (
                              <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: themeConfig.colors.textSecondary }}>
                                {provider.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getProviderStatusColor(provider.id)}`} />
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              multiProviderSettings.currentProvider === provider.id && expandedProvider === provider.id ? 'rotate-90' : ''
                            }`} 
                            style={{ color: themeConfig.colors.textSecondary }}
                          />
                        </div>
                      </div>
                      
                      {/* Mobile description */}
                      {deviceInfo.type === 'mobile' && (
                        <p className="text-xs mt-1 ml-11" style={{ color: themeConfig.colors.textSecondary }}>
                          {provider.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Configuration */}
              {multiProviderSettings.currentProvider === expandedProvider && (
                <div 
                  className="rounded-2xl p-4 sm:p-6 shadow-lg border animate-fade-in"
                  style={{
                    backgroundColor: themeConfig.colors.surface,
                    borderColor: themeConfig.colors.border,
                  }}
                >
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: themeConfig.colors.primary + '20' }}
                    >
                      {getProviderIcon(multiProviderSettings.currentProvider)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
                        {currentProviderConfig.name}
                      </h3>
                      <p className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                        {language === 'pt-BR' ? 'Configuração' : 'Configuration'}
                      </p>
                    </div>
                  </div>
  
                  <div className="space-y-4 sm:space-y-6">
                    {/* API Key */}
                    {currentProviderConfig.requiresApiKey && (
                      <div>
                        <label className="block text-sm font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.text }}>
                          {currentProviderConfig.apiKeyLabel}
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={currentProviderSettings.apiKey}
                            onChange={(e) => handleProviderSettingChange(
                              multiProviderSettings.currentProvider,
                              'apiKey',
                              e.target.value
                            )}
                            placeholder={currentProviderConfig.apiKeyPlaceholder}
                            className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-12 border-2 rounded-xl sm:rounded-2xl focus:border-2 outline-none transition-all duration-200 text-sm sm:text-base"
                            style={{
                              backgroundColor: themeConfig.colors.background,
                              borderColor: currentProviderSettings.apiKey ? themeConfig.colors.primary : themeConfig.colors.border,
                              color: themeConfig.colors.text,
                              boxShadow: currentProviderSettings.apiKey ? `0 0 0 4px ${themeConfig.colors.primary}20` : 'none',
                            }}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                            <button
                              onClick={toggleShowApiKey}
                              className="p-1.5 rounded-full transition-colors"
                              style={{ color: themeConfig.colors.textMuted }}
                              aria-label={showApiKey ? "Hide API key" : "Show API key"}
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {currentProviderSettings.apiKey && (
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: themeConfig.colors.success }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="mt-2 text-xs" style={{ color: themeConfig.colors.textMuted }}>
                          {t.apiKeyStored}
                        </p>
                        
                        {/* Setup Instructions - Collapsible on mobile */}
                        <div 
                          className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border"
                          style={{ 
                            backgroundColor: themeConfig.colors.info + '10',
                            borderColor: themeConfig.colors.info + '30'
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeConfig.colors.info }} />
                            <p className="text-xs sm:text-sm font-semibold" style={{ color: themeConfig.colors.info }}>
                              {language === 'pt-BR' ? 'Como obter sua chave:' : 'How to get your key:'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {currentProviderConfig.setupInstructions.map((instruction, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div 
                                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0"
                                  style={{ 
                                    backgroundColor: themeConfig.colors.info,
                                    color: 'white'
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <span className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.info }}>
                                  {instruction}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
  
                    {/* Base URL (for local providers) */}
                    {(multiProviderSettings.currentProvider === 'ollama') && (
                      <div>
                        <label className="block text-sm font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.text }}>
                          {language === 'pt-BR' ? 'URL Base' : 'Base URL'}
                        </label>
                        <input
                          type="url"
                          value={currentProviderSettings.baseUrl || ''}
                          onChange={(e) => handleProviderSettingChange(
                            multiProviderSettings.currentProvider,
                            'baseUrl',
                            e.target.value
                          )}
                          placeholder="http://localhost:11434/v1"
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:border-2 outline-none transition-all duration-200 text-sm sm:text-base"
                          style={{
                            backgroundColor: themeConfig.colors.background,
                            borderColor: currentProviderSettings.baseUrl ? themeConfig.colors.primary : themeConfig.colors.border,
                            color: themeConfig.colors.text,
                            boxShadow: currentProviderSettings.baseUrl ? `0 0 0 4px ${themeConfig.colors.primary}20` : 'none',
                          }}
                        />
                      </div>
                    )}
  
                    {/* Model Selection */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.text }}>
                        {language === 'pt-BR' ? 'Modelo' : 'Model'}
                      </label>
                      <select
                        value={currentProviderSettings.model}
                        onChange={(e) => handleProviderSettingChange(
                          multiProviderSettings.currentProvider,
                          'model',
                          e.target.value
                        )}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:border-2 outline-none transition-all duration-200 text-sm sm:text-base appearance-none"
                        style={{
                          backgroundColor: themeConfig.colors.background,
                          borderColor: themeConfig.colors.border,
                          color: themeConfig.colors.text,
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${themeConfig.colors.textMuted.slice(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 1rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                        }}
                      >
                        {currentProviderConfig.models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} {model.recommended ? '(Recommended)' : ''}
                          </option>
                        ))}
                      </select>
                      
                      {/* Model Info */}
                      {(() => {
                        const selectedModel = getModel(multiProviderSettings.currentProvider, currentProviderSettings.model);
                        if (!selectedModel) return null;
                        
                        return (
                          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                              {selectedModel.description}
                            </p>
                            {getModelBadge(multiProviderSettings.currentProvider, currentProviderSettings.model)}
                          </div>
                        );
                      })()}
                    </div>
  
                    {/* Validation Status */}
                    {!validation.valid && (
                      <div 
                        className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border"
                        style={{ 
                          backgroundColor: themeConfig.colors.error + '10',
                          borderColor: themeConfig.colors.error + '30'
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.error }} />
                          <div>
                            <p className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2" style={{ color: themeConfig.colors.error }}>
                              {language === 'pt-BR' ? 'Configuração Inválida' : 'Invalid Configuration'}
                            </p>
                            <div className="space-y-1">
                              {validation.errors.map((error, index) => (
                                <p key={index} className="text-xs sm:text-sm" style={{ color: themeConfig.colors.error }}>
                                  • {error}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'language' && (
            <div 
              className="rounded-2xl p-4 sm:p-6 shadow-lg border"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border,
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6" style={{ color: themeConfig.colors.text }}>
                {t.selectLanguage}
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
                  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => changeLanguage(lang.value as Language)}
                    className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left ${
                      language === lang.value ? 'shadow-lg transform scale-[1.02]' : 'hover:shadow-md'
                    }`}
                    style={{
                      borderColor: language === lang.value ? themeConfig.colors.primary : themeConfig.colors.border,
                      backgroundColor: language === lang.value 
                        ? themeConfig.colors.primary + '10' 
                        : themeConfig.colors.background,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <span className="text-2xl sm:text-3xl">{lang.flag}</span>
                        <div>
                          <span className="font-semibold text-sm sm:text-base block" style={{ color: themeConfig.colors.text }}>
                            {lang.label}
                          </span>
                          <span className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                            {lang.value === 'en-US' ? 'Default language' : 'Idioma padrão'}
                          </span>
                        </div>
                      </div>
                      {language === lang.value && (
                        <Check className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.primary }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Language help section */}
              <div 
                className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl border"
                style={{ 
                  backgroundColor: themeConfig.colors.info + '10',
                  borderColor: themeConfig.colors.info + '30'
                }}
              >
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: themeConfig.colors.info }} />
                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' ? 'Dica de Idioma' : 'Language Tip'}
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.info }}>
                      {language === 'pt-BR' 
                        ? 'Ao mudar o idioma, a página será recarregada e você será redirecionado para a página inicial. Suas configurações serão preservadas.'
                        : 'When changing language, the page will refresh and you will be redirected to the home page. Your settings will be preserved.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div 
              className="rounded-2xl p-4 sm:p-6 shadow-lg border"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border,
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6" style={{ color: themeConfig.colors.text }}>
                {t.manageYourData}
              </h3>
              
              <div 
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border"
                style={{ 
                  backgroundColor: themeConfig.colors.error + '10',
                  borderColor: themeConfig.colors.error + '30'
                }}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: themeConfig.colors.error + '20' }}
                  >
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.error }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2" style={{ color: themeConfig.colors.error }}>
                      {t.deleteAllData}
                    </h4>
                    <p className="text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed" style={{ color: themeConfig.colors.error }}>
                      {t.deleteAllDataDesc}
                    </p>
                    <button
                      onClick={handleDeleteAllData}
                      className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-medium sm:font-semibold text-sm sm:text-base transition-all duration-200 text-white shadow-lg hover:shadow-xl"
                      style={{ backgroundColor: themeConfig.colors.error }}
                    >
                      {t.deleteAllData}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Device Type Indicator (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/50 text-white">
            <div className="flex items-center space-x-1">
              {deviceInfo.type === 'mobile' && <Smartphone className="w-3 h-3" />}
              {deviceInfo.type === 'tablet' && <Tablet className="w-3 h-3" />}
              {deviceInfo.type === 'desktop' && <Monitor className="w-3 h-3" />}
              <span>{deviceInfo.type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
