import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff, ExternalLink, Bot, MessageSquare, Github, Linkedin, Brain, Globe, RefreshCw, Cloud, CheckCircle, X, Trash2, AlertTriangle, Database } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { Language, LearningTechniquesPreference, LearningSettings } from '../types';
import LanguageSwitchModal from './LanguageSwitchModal';

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'gpt4oRecommended', description: 'latestMostCapable' },
  { value: 'gpt-4o-mini', label: 'gpt4oMini', description: 'fasterCostEffective' },
  { value: 'gpt-4-turbo', label: 'gpt4Turbo', description: 'highPerformance' },
  { value: 'gpt-4', label: 'gpt4', description: 'previousGeneration' },
  { value: 'gpt-3.5-turbo', label: 'gpt35Turbo', description: 'fastEconomical' },
];

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
];

const getDefaultPrompts = (language: Language) => ({
  multipleChoice: language === 'pt-BR' 
    ? `Você é um assistente de estudos que cria questões de múltipla escolha sobre {subject}. Crie uma questão desafiadora mas justa com 4 opções. Retorne um objeto JSON com: question (string), options (array de 4 strings), correctAnswer (número 0-3), e explanation (string explicando por que a resposta correta está certa).`
    : `You are a study assistant that creates multiple choice questions about {subject}. Create a challenging but fair question with 4 options. Return a JSON object with: question (string), options (array of 4 strings), correctAnswer (number 0-3), and explanation (string explaining why the correct answer is right).`,
  dissertative: language === 'pt-BR'
    ? `Você é um assistente de estudos que cria questões dissertativas sobre {subject}. Crie uma questão aberta que requer análise reflexiva e explicação. Retorne um objeto JSON com: question (string), sampleAnswer (string com uma resposta modelo abrangente), e evaluationCriteria (array de strings descrevendo o que torna uma boa resposta).`
    : `You are a study assistant that creates dissertative questions about {subject}. Create an open-ended question that requires thoughtful analysis and explanation. Return a JSON object with: question (string), sampleAnswer (string with a comprehensive model answer), and evaluationCriteria (array of strings describing what makes a good answer).`,
  evaluation: language === 'pt-BR'
    ? `Você está avaliando a resposta de um estudante para uma questão dissertativa. Questão: {question}. Resposta do estudante: {userAnswer}. Resposta modelo: {modelAnswer}. Forneça feedback construtivo focando na precisão, completude e compreensão. Avalie a resposta e sugira melhorias. Seja encorajador mas honesto.`
    : `You are evaluating a student's answer to a dissertative question. Question: {question}. Student's answer: {userAnswer}. Model answer: {modelAnswer}. Provide constructive feedback focusing on accuracy, completeness, and understanding. Rate the answer and suggest improvements. Be encouraging but honest.`,
  elaborativePrompt: language === 'pt-BR'
    ? `Gere uma questão de interrogação elaborativa que pergunta "por que" para ajudar o estudante a entender o raciocínio mais profundo por trás do conceito em {subject}. Foque em ajudá-los a conectar ideias e entender princípios subjacentes.`
    : `Generate an elaborative interrogation question that asks "why" to help the student understand the deeper reasoning behind the concept in {subject}. Focus on helping them connect ideas and understand underlying principles.`,
  retrievalPrompt: language === 'pt-BR'
    ? `Crie uma questão de prática de recuperação sobre {subject} que teste a recordação de conceitos importantes. Isso deve ajudar a fortalecer a memória através da recordação ativa. Retorne um objeto JSON com formato apropriado para o tipo de questão.`
    : `Create a retrieval practice question about {subject} that tests recall of important concepts. This should help strengthen memory through active recall. Return a JSON object with appropriate format for the question type.`
});

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
    customPrompts: getDefaultPrompts(language)
  });

  const [learningPreference, setLearningPreference] = useLocalStorage<LearningTechniquesPreference>('studorama-learning-preference', DEFAULT_LEARNING_PREFERENCE);
  const [sessions, setSessions] = useLocalStorage('studorama-sessions', []);

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiSettings.openaiApiKey);
  const [tempModel, setTempModel] = useState(apiSettings.model || 'gpt-4o-mini');
  const [tempPrompts, setTempPrompts] = useState(apiSettings.customPrompts || getDefaultPrompts(language));
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'prompts' | 'learning' | 'language' | 'data' | 'about'>('api');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
  const [preferencesReset, setPreferencesReset] = useState(false);
  const [showDeleteSessionsModal, setShowDeleteSessionsModal] = useState(false);
  const [showDeleteAllDataModal, setShowDeleteAllDataModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    setApiSettings({ 
      openaiApiKey: tempApiKey,
      model: tempModel,
      customPrompts: tempPrompts
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetPrompts = () => {
    const defaultPrompts = getDefaultPrompts(language);
    setTempPrompts(defaultPrompts);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return;

    // Check if user has remembered their choice
    if (languageSwitchPreference.rememberChoice) {
      // Apply the remembered preference
      if (languageSwitchPreference.autoResetPrompts) {
        const defaultPrompts = getDefaultPrompts(newLanguage);
        setTempPrompts(defaultPrompts);
        setApiSettings(prev => ({
          ...prev,
          customPrompts: defaultPrompts
        }));
      }
      changeLanguage(newLanguage);
    } else {
      // Show modal for user to choose
      setPendingLanguage(newLanguage);
      setShowLanguageModal(true);
    }
  };

  const handleLanguageModalConfirm = (resetPrompts: boolean, rememberChoice: boolean) => {
    if (!pendingLanguage) return;

    // Update language switch preferences if user chose to remember
    if (rememberChoice) {
      updateLanguageSwitchPreference({
        rememberChoice: true,
        autoResetPrompts: resetPrompts
      });
    }

    // Apply language change
    changeLanguage(pendingLanguage);

    // Reset prompts if requested
    if (resetPrompts) {
      const defaultPrompts = getDefaultPrompts(pendingLanguage);
      setTempPrompts(defaultPrompts);
      setApiSettings(prev => ({
        ...prev,
        customPrompts: defaultPrompts
      }));
    }

    setPendingLanguage(null);
  };

  const handleResetLanguagePreferences = () => {
    resetLanguageSwitchPreference();
    setPreferencesReset(true);
    setTimeout(() => setPreferencesReset(false), 3000);
  };

  const updateLearningPreference = (updates: Partial<LearningTechniquesPreference>) => {
    setLearningPreference(prev => ({ ...prev, ...updates }));
  };

  const handleDeleteAllSessions = async () => {
    setIsDeleting(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSessions([]);
    setShowDeleteSessionsModal(false);
    setIsDeleting(false);
    
    // Show success message
    alert(t.sessionsDeleted);
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear all Studorama data from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('studorama-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setShowDeleteAllDataModal(false);
    setIsDeleting(false);
    
    // Show success message and reload page
    alert(t.allDataDeleted);
    window.location.reload();
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

  const isValid = tempApiKey.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.settingsTitle}</h1>
        <p className="text-gray-600">{t.configurePreferences}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'api', label: t.apiConfiguration, icon: Key },
              { id: 'prompts', label: t.aiPrompts, icon: MessageSquare },
              { id: 'learning', label: t.learningTechniquesTab, icon: Brain },
              { id: 'language', label: t.language, icon: Globe },
              { id: 'data', label: t.dataManagement, icon: Database },
              { id: 'about', label: t.about, icon: Bot }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* API Configuration Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.apiConfiguration}</h2>
                  <p className="text-sm text-gray-600">{t.openaiApiConfig}</p>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.openaiApiKey}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="api-key"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t.apiKeyStored}
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.openaiModel}
                </label>
                <select
                  id="model"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white"
                >
                  {OPENAI_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {t[model.label as keyof typeof t] || model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {(() => {
                    const selectedModel = OPENAI_MODELS.find(m => m.value === tempModel);
                    return selectedModel ? t[selectedModel.description as keyof typeof t] || selectedModel.description : '';
                  })()}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">{t.howToGetApiKey}</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. {t.openaiPlatform} <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:no-underline inline-flex items-center">
                    OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
                  </a></li>
                  <li>2. {t.signInOrCreate}</li>
                  <li>3. {t.createSecretKey}</li>
                  <li>4. {t.copyPasteKey}</li>
                </ol>
              </div>
            </div>
          )}

          {/* AI Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t.aiPromptsCustomization}</h2>
                    <p className="text-sm text-gray-600">{t.customizeGeneration}</p>
                  </div>
                </div>
                <button
                  onClick={resetPrompts}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  {t.resetToDefaults}
                </button>
              </div>

              {/* Multiple Choice Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.multipleChoicePrompt}
                </label>
                <textarea
                  value={tempPrompts.multipleChoice}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, multipleChoice: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating multiple choice questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.subjectPlaceholder2}
                </p>
              </div>

              {/* Dissertative Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dissertativePrompt}
                </label>
                <textarea
                  value={tempPrompts.dissertative}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, dissertative: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating dissertative questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.subjectPlaceholder2}
                </p>
              </div>

              {/* Evaluation Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.answerEvaluationPrompt}
                </label>
                <textarea
                  value={tempPrompts.evaluation}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, evaluation: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for evaluating dissertative answers..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.questionPlaceholder}{t.userAnswerPlaceholder} {t.modelAnswerPlaceholder}
                </p>
              </div>

              {/* Elaborative Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.elaborativeInterrogationPrompt}
                </label>
                <textarea
                  value={tempPrompts.elaborativePrompt}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, elaborativePrompt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating elaborative questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.subjectPlaceholder2}
                </p>
              </div>

              {/* Retrieval Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.retrievalPracticePrompt}
                </label>
                <textarea
                  value={tempPrompts.retrievalPrompt}
                  onChange={(e) => setTempPrompts(prev => ({ ...prev, retrievalPrompt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  placeholder="Enter the prompt for generating retrieval practice questions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.subjectPlaceholder2}
                </p>
              </div>
            </div>
          )}

          {/* Learning Techniques Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.learningTechniquesSettings}</h2>
                  <p className="text-sm text-gray-600">{t.manageLearningTechniques}</p>
                </div>
              </div>

              {/* Default Learning Techniques */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">{t.defaultLearningTechniques}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(learningPreference.defaultSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateLearningPreference({
                          defaultSettings: {
                            ...learningPreference.defaultSettings,
                            [key]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-800">
                        {getLearningTechniqueLabel(key)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remember Choice Setting */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-blue-900">{t.rememberChoiceForSessions}</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={learningPreference.rememberChoice}
                      onChange={(e) => updateLearningPreference({ rememberChoice: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    {learningPreference.rememberChoice && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-blue-800 mb-4">
                  {t.rememberChoiceDescription}
                </p>
                
                {learningPreference.rememberChoice && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">
                        {language === 'pt-BR' ? 'Status: Ativo' : 'Status: Active'}
                      </span>
                      <button
                        onClick={() => updateLearningPreference({ rememberChoice: false })}
                        className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title={t.unsetRememberChoice}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      {language === 'pt-BR' 
                        ? 'Novas sessões usarão automaticamente suas técnicas de aprendizado padrão.'
                        : 'New sessions will automatically use your default learning techniques.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Learning Techniques Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.researchBasedBenefits}</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• <strong>{language === 'pt-BR' ? 'Retenção melhorada:' : 'Improved retention:'}</strong> {t.improvedRetention}</li>
                  <li>• <strong>{language === 'pt-BR' ? 'Melhor transferência:' : 'Better transfer:'}</strong> {t.betterTransfer}</li>
                  <li>• <strong>{language === 'pt-BR' ? 'Compreensão mais profunda:' : 'Deeper understanding:'}</strong> {t.deeperUnderstanding}</li>
                  <li>• <strong>{language === 'pt-BR' ? 'Consciência metacognitiva:' : 'Metacognitive awareness:'}</strong> {t.metacognitiveAwareness}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.language}</h2>
                  <p className="text-sm text-gray-600">{t.selectLanguage}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleLanguageChange(lang.value)}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                      language === lang.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{lang.label}</h3>
                        <p className="text-sm text-gray-600">
                          {lang.value === 'en-US' ? 'English (United States)' : 'Português (Brasil)'}
                        </p>
                      </div>
                      {language === lang.value && (
                        <div className="ml-auto w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Language Switch Preferences */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.languageSwitchPreferences}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{t.rememberChoice}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      languageSwitchPreference.rememberChoice 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {languageSwitchPreference.rememberChoice ? t.yes : t.no}
                    </span>
                  </div>
                  {languageSwitchPreference.rememberChoice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t.resetPromptsOption}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        languageSwitchPreference.autoResetPrompts 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {languageSwitchPreference.autoResetPrompts ? t.yes : t.no}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleResetLanguagePreferences}
                  className="mt-3 text-sm text-orange-600 hover:text-orange-700 underline"
                >
                  {t.resetLanguagePreferences}
                </button>
                {preferencesReset && (
                  <p className="text-sm text-green-600 mt-2">{t.languagePreferencesReset}</p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">
                  {language === 'pt-BR' ? 'Detecção Automática' : 'Automatic Detection'}
                </h3>
                <p className="text-sm text-green-700">
                  {language === 'pt-BR' 
                    ? 'O idioma é detectado automaticamente baseado nas configurações do seu navegador e salvo localmente. Os prompts da IA também são atualizados automaticamente para corresponder ao idioma selecionado.'
                    : 'Language is automatically detected based on your browser settings and saved locally. AI prompts are also automatically updated to match the selected language.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.dataManagement}</h2>
                  <p className="text-sm text-gray-600">{t.manageYourData}</p>
                </div>
              </div>

              {/* Delete All Sessions */}
              <div className="bg-white border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.deleteAllSessions}</h3>
                    <p className="text-gray-600 mb-4">
                      {language === 'pt-BR' 
                        ? 'Excluir permanentemente todas as suas sessões de estudo e progresso'
                        : 'Permanently delete all your study sessions and progress'
                      }
                    </p>
                    <button
                      onClick={() => setShowDeleteSessionsModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.deleteAllSessions}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete All Data */}
              <div className="bg-white border border-red-300 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.deleteAllData}</h3>
                    <p className="text-gray-600 mb-4">
                      {t.deleteAllDataDesc}
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-800 text-sm font-medium">
                        ⚠️ {language === 'pt-BR' 
                          ? 'Esta ação excluirá TODOS os dados do Studorama, incluindo sessões, configurações, chaves da API e preferências.'
                          : 'This action will delete ALL Studorama data including sessions, settings, API keys, and preferences.'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteAllDataModal(true)}
                      className="bg-red-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-800 transition-colors flex items-center"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {t.deleteAllData}
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  {language === 'pt-BR' ? 'Privacidade dos Dados' : 'Data Privacy'}
                </h3>
                <p className="text-sm text-blue-700">
                  {language === 'pt-BR' 
                    ? 'Todos os seus dados são armazenados localmente no seu navegador. Nenhum dado é enviado para nossos servidores. Quando você exclui dados, eles são removidos permanentemente do seu dispositivo.'
                    : 'All your data is stored locally in your browser. No data is sent to our servers. When you delete data, it is permanently removed from your device.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t.aboutStudorama}</h2>
                  <p className="text-sm text-gray-600">{t.aiPoweredPlatform}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.createdBy}</h3>
                <p className="text-gray-700 mb-4">
                  {t.studoramaDescription}
                </p>
                <div className="flex items-center space-x-4">
                  <a
                    href="https://github.com/oluiscabral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    {t.github}
                  </a>
                  <a
                    href="https://www.linkedin.com/in/oluiscabral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 mr-2" />
                    {t.linkedin}
                  </a>
                </div>
              </div>

              {/* Open Source Section */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <Github className="w-6 h-6 mr-2" />
                  {t.openSourceProject}
                </h3>
                <p className="text-purple-800 mb-4">
                  {t.openSourceDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://github.com/oluiscabral/studorama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    {t.viewOnGitHub}
                  </a>
                  <a
                    href="https://github.com/oluiscabral/studorama/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-white text-purple-600 border border-purple-300 px-4 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {t.reportIssue}
                  </a>
                </div>
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-purple-700 text-sm">
                    <strong>Repository:</strong> https://github.com/oluiscabral/studorama
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{t.coreFeatures}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t.aiGeneratedQuestions}</li>
                    <li>• {t.mixedQuestionTypes}</li>
                    <li>• {t.spacedRepetitionScheduling}</li>
                    <li>• {t.elaborativePrompts}</li>
                    <li>• {t.selfExplanationExercises}</li>
                    <li>• {t.confidenceTracking}</li>
                    <li>• {t.sessionHistoryAnalytics}</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{t.learningScience}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t.makeItStickResearch}</li>
                    <li>• {t.retrievalPracticeImplementation}</li>
                    <li>• {t.desirableDifficultiesIntegration}</li>
                    <li>• {t.generationEffectUtilization}</li>
                    <li>• {t.metacognitiveStrategyTraining}</li>
                    <li>• {t.evidenceBasedSpacing}</li>
                    <li>• {t.cognitiveLoadOptimization}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">{t.privacySecurity}</h4>
                <p className="text-sm text-green-700">
                  {t.privacyDescription}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">{t.scientificFoundation}</h4>
                <p className="text-sm text-blue-700">
                  {t.scientificDescription}
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          {(activeTab === 'api' || activeTab === 'prompts') && (
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={!isValid && activeTab === 'api'}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  (isValid || activeTab === 'prompts')
                    ? saved
                      ? 'bg-green-600 text-white'
                      : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5 mr-2" />
                {saved ? t.saved : t.saveSettings}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t.configurationStatus}</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t.openaiApiKey}</span>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              apiSettings.openaiApiKey
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {apiSettings.openaiApiKey ? t.configured : t.notConfigured}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t.selectedModel}</span>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {(() => {
                const selectedModel = OPENAI_MODELS.find(m => m.value === (apiSettings.model || 'gpt-4o-mini'));
                return selectedModel ? t[selectedModel.label as keyof typeof t] || selectedModel.label : t.gpt4oMini;
              })()}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t.language}</span>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {LANGUAGES.find(l => l.value === language)?.label || 'English (US)'}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t.learningTechniquesTab}</span>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              learningPreference.rememberChoice 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {learningPreference.rememberChoice 
                ? (language === 'pt-BR' ? 'Lembradas' : 'Remembered')
                : t.enhancedStudyMode
              }
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t.study}</span>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              apiSettings.openaiApiKey
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {apiSettings.openaiApiKey ? t.ready : t.requiresApiKey}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Sessions Confirmation Modal */}
      {showDeleteSessionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.deleteAllSessions}
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  {t.deleteAllSessionsConfirm}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ {t.deleteAllSessionsWarning}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteSessionsModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleDeleteAllSessions}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.delete}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Data Confirmation Modal */}
      {showDeleteAllDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.deleteAllData}
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  {t.deleteAllDataConfirm}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ {t.deleteAllDataWarning}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteAllDataModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {t.delete}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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