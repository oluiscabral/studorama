import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff, ExternalLink, Bot, MessageSquare, Github, Linkedin, Brain, Globe } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../types';

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)', description: 'Latest and most capable model' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Faster and more cost-effective' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High performance model' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Previous generation flagship model' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and economical' },
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

export default function Settings() {
  const { t, language, changeLanguage } = useLanguage();
  const [apiSettings, setApiSettings] = useLocalStorage('studorama-api-settings', {
    openaiApiKey: '',
    model: 'gpt-4o-mini',
    customPrompts: getDefaultPrompts(language)
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiSettings.openaiApiKey);
  const [tempModel, setTempModel] = useState(apiSettings.model || 'gpt-4o-mini');
  const [tempPrompts, setTempPrompts] = useState(apiSettings.customPrompts || getDefaultPrompts(language));
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'prompts' | 'learning' | 'language' | 'about'>('api');

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
    changeLanguage(newLanguage);
    // Update prompts to match new language
    const defaultPrompts = getDefaultPrompts(newLanguage);
    setTempPrompts(defaultPrompts);
    // Update saved settings with new language prompts
    setApiSettings(prev => ({
      ...prev,
      customPrompts: defaultPrompts
    }));
  };

  const isValid = tempApiKey.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {OPENAI_MODELS.find(m => m.value === tempModel)?.description}
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
                  {language === 'pt-BR' ? 'Use {subject} como placeholder para a matéria de estudo.' : 'Use {subject} as a placeholder for the study subject.'}
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
                  {language === 'pt-BR' ? 'Use {subject} como placeholder para a matéria de estudo.' : 'Use {subject} as a placeholder for the study subject.'}
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
                  {language === 'pt-BR' 
                    ? 'Use {question}, {userAnswer}, e {modelAnswer} como placeholders.'
                    : 'Use {question}, {userAnswer}, and {modelAnswer} as placeholders.'
                  }
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
                  {language === 'pt-BR' ? 'Use {subject} como placeholder para a matéria de estudo.' : 'Use {subject} as a placeholder for the study subject.'}
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
                  {language === 'pt-BR' ? 'Use {subject} como placeholder para a matéria de estudo.' : 'Use {subject} as a placeholder for the study subject.'}
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
                  <h2 className="text-lg font-semibold text-gray-900">{t.learningTechniquesTab}</h2>
                  <p className="text-sm text-gray-600">{t.makeItStickScience}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.spacedRepetition}</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    {t.spacedRepetitionFull}
                  </p>
                  <div className="text-xs text-blue-700">
                    <strong>{language === 'pt-BR' ? 'Como funciona:' : 'How it works:'}</strong> {t.spacedRepetitionHow}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">{t.interleaving}</h3>
                  <p className="text-sm text-green-800 mb-4">
                    {t.interleavingFull}
                  </p>
                  <div className="text-xs text-green-700">
                    <strong>{language === 'pt-BR' ? 'Como funciona:' : 'How it works:'}</strong> {t.interleavingHow}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">{t.elaborativeInterrogation}</h3>
                  <p className="text-sm text-purple-800 mb-4">
                    {t.elaborativeInterrogationFull}
                  </p>
                  <div className="text-xs text-purple-700">
                    <strong>{language === 'pt-BR' ? 'Como funciona:' : 'How it works:'}</strong> {t.elaborativeInterrogationHow}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">{t.selfExplanation}</h3>
                  <p className="text-sm text-orange-800 mb-4">
                    {t.selfExplanationFull}
                  </p>
                  <div className="text-xs text-orange-700">
                    <strong>{language === 'pt-BR' ? 'Como funciona:' : 'How it works:'}</strong> {t.selfExplanationHow}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">{t.desirableDifficulties}</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    {t.desirableDifficultiesFull}
                  </p>
                  <div className="text-xs text-yellow-700">
                    <strong>{language === 'pt-BR' ? 'Como funciona:' : 'How it works:'}</strong> {t.desirableDifficultiesHow}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
                  <h3 className="text-lg font-semibold text-teal-900 mb-3">{t.retrievalPractice}</h3>
                  <p className="text-sm text-teal-800 mb-4">
                    {t.retrievalPracticeFull}
                  </p>
                  <div className="text-xs text-teal-700">
                    <strong>{language === 'pt-BR' ? 'Como funciona:' : 'How it works:'}</strong> {t.retrievalPracticeHow}
                  </div>
                </div>
              </div>

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
              {OPENAI_MODELS.find(m => m.value === (apiSettings.model || 'gpt-4o-mini'))?.label || 'GPT-4o Mini'}
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
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {t.enhancedStudyMode}
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
    </div>
  );
}