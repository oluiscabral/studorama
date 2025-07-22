export type Language = 'en-US' | 'pt-BR';

export interface LanguageSettings {
  language: Language;
}

export interface Translations {
  // Navigation
  dashboard: string;
  study: string;
  history: string;
  settings: string;
  
  // Dashboard
  welcomeTitle: string;
  welcomeSubtitle: string;
  setupRequired: string;
  configureApiKey: string;
  readyToStudy: string;
  usingModel: string;
  totalSessions: string;
  completed: string;
  averageScore: string;
  startNewSession: string;
  beginNewSession: string;
  viewHistory: string;
  reviewPastSessions: string;
  recentSessions: string;
  questions: string;
  inProgress: string;
  score: string;
  
  // Study Session
  startNewStudySession: string;
  configureSession: string;
  studySubject: string;
  subjectPlaceholder: string;
  subjectModifiers: string;
  subjectModifiersPlaceholder: string;
  addModifier: string;
  removeModifier: string;
  questionType: string;
  multipleChoice: string;
  quickAssessment: string;
  dissertative: string;
  deepAnalysis: string;
  mixed: string;
  interleavedPractice: string;
  learningTechniques: string;
  makeItStickBased: string;
  spacedRepetitionDesc: string;
  interleavingDesc: string;
  elaborativeInterrogationDesc: string;
  retrievalPracticeDesc: string;
  rememberMyChoice: string;
  rememberLearningTechniques: string;
  readyToLearn: string;
  startEnhancedSession: string;
  configureApiKeyFirst: string;
  generatingQuestion: string;
  using: string;
  currentScore: string;
  question: string;
  easy: string;
  medium: string;
  hard: string;
  confidenceQuestion: string;
  notConfident: string;
  veryConfident: string;
  excellent: string;
  keepLearning: string;
  aiEvaluation: string;
  modelAnswer: string;
  elaborativePrompt: string;
  explainReasoning: string;
  selfExplanationPrompt: string;
  connectKnowledge: string;
  endSession: string;
  submitAnswer: string;
  evaluating: string;
  tryAgain: string;
  nextQuestion: string;
  pauseSession: string;
  resumeSession: string;
  
  // Session History
  studyHistory: string;
  reviewProgress: string;
  newSession: string;
  noSessionsYet: string;
  startFirstSession: string;
  allSessions: string;
  questionsAnswered: string;
  date: string;
  accuracy: string;
  continue: string;
  viewDetails: string;
  correctAnswers: string;
  deleteAllSessions: string;
  deleteAllSessionsConfirm: string;
  deleteAllSessionsWarning: string;
  sessionsDeleted: string;
  
  // Session Details
  sessionNotFound: string;
  sessionNotFoundDesc: string;
  backToHistory: string;
  sessionDetails: string;
  questionsAndAnswers: string;
  correct: string;
  yourAnswer: string;
  feedback: string;
  attempts: string;
  attempt: string;
  continueSession: string;
  
  // Settings
  settingsTitle: string;
  configurePreferences: string;
  apiConfiguration: string;
  openaiApiConfig: string;
  openaiApiKey: string;
  apiKeyStored: string;
  openaiModel: string;
  howToGetApiKey: string;
  openaiPlatform: string;
  signInOrCreate: string;
  createSecretKey: string;
  copyPasteKey: string;
  aiPrompts: string;
  aiPromptsCustomization: string;
  customizeGeneration: string;
  resetToDefaults: string;
  multipleChoicePrompt: string;
  dissertativePrompt: string;
  answerEvaluationPrompt: string;
  elaborativeInterrogationPrompt: string;
  retrievalPracticePrompt: string;
  subjectPlaceholder2: string;
  questionPlaceholder: string;
  userAnswerPlaceholder: string;
  modelAnswerPlaceholder: string;
  learningTechniquesTab: string;
  learningTechniquesSettings: string;
  manageLearningTechniques: string;
  defaultLearningTechniques: string;
  rememberChoiceForSessions: string;
  rememberChoiceDescription: string;
  unsetRememberChoice: string;
  makeItStickScience: string;
  spacedRepetition: string;
  spacedRepetitionFull: string;
  spacedRepetitionHow: string;
  interleaving: string;
  interleavingFull: string;
  interleavingHow: string;
  elaborativeInterrogation: string;
  elaborativeInterrogationFull: string;
  elaborativeInterrogationHow: string;
  selfExplanation: string;
  selfExplanationFull: string;
  selfExplanationHow: string;
  desirableDifficulties: string;
  desirableDifficultiesFull: string;
  desirableDifficultiesHow: string;
  retrievalPractice: string;
  retrievalPracticeFull: string;
  retrievalPracticeHow: string;
  generationEffect: string;
  researchBasedBenefits: string;
  improvedRetention: string;
  betterTransfer: string;
  deeperUnderstanding: string;
  metacognitiveAwareness: string;
  language: string;
  selectLanguage: string;
  about: string;
  aboutStudorama: string;
  aiPoweredPlatform: string;
  createdBy: string;
  studoramaDescription: string;
  github: string;
  linkedin: string;
  coreFeatures: string;
  aiGeneratedQuestions: string;
  mixedQuestionTypes: string;
  spacedRepetitionScheduling: string;
  elaborativePrompts: string;
  selfExplanationExercises: string;
  confidenceTracking: string;
  sessionHistoryAnalytics: string;
  learningScience: string;
  makeItStickResearch: string;
  retrievalPracticeImplementation: string;
  desirableDifficultiesIntegration: string;
  generationEffectUtilization: string;
  metacognitiveStrategyTraining: string;
  evidenceBasedSpacing: string;
  cognitiveLoadOptimization: string;
  privacySecurity: string;
  privacyDescription: string;
  scientificFoundation: string;
  scientificDescription: string;
  openSourceProject: string;
  openSourceDescription: string;
  viewOnGitHub: string;
  contributeToProject: string;
  reportIssue: string;
  requestFeature: string;
  saveSettings: string;
  saved: string;
  configurationStatus: string;
  configured: string;
  notConfigured: string;
  selectedModel: string;
  enhancedStudyMode: string;
  ready: string;
  requiresApiKey: string;
  
  // AI Provider Settings
  aiProvider: string;
  aiProviderSelection: string;
  selectAiProvider: string;
  providerConfiguration: string;
  configureProvider: string;
  providerStatus: string;
  providerReady: string;
  providerNotConfigured: string;
  providerInvalidConfig: string;
  invalidConfiguration: string;
  apiKeyRequired: string;
  invalidApiKeyFormat: string;
  invalidBaseUrl: string;
  modelSelection: string;
  selectModel: string;
  modelInfo: string;
  costTier: string;
  contextWindow: string;
  capabilities: string;
  recommended: string;
  tokens: string;
  
  // Cost Tiers
  free: string;
  low: string;
  high: string;
  
  // Provider Names & Descriptions
  openaiProvider: string;
  openaiDescription: string;
  geminiProvider: string;
  geminiDescription: string;
  anthropicProvider: string;
  anthropicDescription: string;
  deepseekProvider: string;
  deepseekDescription: string;
  ollamaProvider: string;
  ollamaDescription: string;
  browserProvider: string;
  browserDescription: string;
  
  // Model Names & Descriptions
  gpt4o: string;
  gpt4oDescription: string;
  gpt4oMini: string;
  gpt4oMiniDescription: string;
  gpt4Turbo: string;
  gpt4TurboDescription: string;
  gpt4: string;
  gpt4Description: string;
  gpt35Turbo: string;
  gpt35TurboDescription: string;
  
  gemini15Pro: string;
  gemini15ProDescription: string;
  gemini15Flash: string;
  gemini15FlashDescription: string;
  geminiPro: string;
  geminiProDescription: string;
  
  claude35Sonnet: string;
  claude35SonnetDescription: string;
  claude3Haiku: string;
  claude3HaikuDescription: string;
  claude3Opus: string;
  claude3OpusDescription: string;
  
  deepseekChat: string;
  deepseekChatDescription: string;
  deepseekCoder: string;
  deepseekCoderDescription: string;
  
  llama318b: string;
  llama318bDescription: string;
  llama3170b: string;
  llama3170bDescription: string;
  mistral7b: string;
  mistral7bDescription: string;
  codellama13b: string;
  codellama13bDescription: string;
  
  browserAi: string;
  browserAiDescription: string;
  
  // API Key Labels
  openaiApiKeyLabel: string;
  geminiApiKeyLabel: string;
  anthropicApiKeyLabel: string;
  deepseekApiKeyLabel: string;
  
  // Setup Instructions
  setupInstructions: string;
  howToGetKey: string;
  
  // OpenAI Setup
  visitPlatformOpenai: string;
  signInOpenai: string;
  navigateApiKeys: string;
  createNewSecretKey: string;
  
  // Gemini Setup
  visitAiStudio: string;
  signInGoogle: string;
  navigateApiKeysGoogle: string;
  createNewApiKey: string;
  
  // Anthropic Setup
  visitConsoleAnthropic: string;
  signInAnthropic: string;
  navigateApiKeysAnthropic: string;
  createNewApiKeyAnthropic: string;
  
  // DeepSeek Setup
  visitPlatformDeepseek: string;
  signInDeepseek: string;
  navigateApiKeysDeepseek: string;
  createNewApiKeyDeepseek: string;
  
  // Ollama Setup
  installOllama: string;
  runOllamaServe: string;
  pullModel: string;
  configureBaseUrl: string;
  
  // Browser AI Setup
  enableExperimentalFeatures: string;
  experimentalFeature: string;
  limitedPerformance: string;
  
  // Configuration Fields
  baseUrl: string;
  baseUrlPlaceholder: string;
  model: string;
  
  // Data Management
  dataManagement: string;
  manageYourData: string;
  deleteAllData: string;
  deleteAllDataConfirm: string;
  deleteAllDataWarning: string;
  allDataDeleted: string;
  deleteAllDataDesc: string;
  
  // Language Switch Modal
  languageChange: string;
  resetPromptsOption: string;
  resetPromptsDescription: string;
  rememberChoice: string;
  confirmChange: string;
  cancel: string;
  languageSwitchPreferences: string;
  manageLanguagePreferences: string;
  resetLanguagePreferences: string;
  languagePreferencesReset: string;
  
  // OpenAI Models
  gpt4oRecommended: string;
  latestMostCapable: string;
  fasterCostEffective: string;
  highPerformance: string;
  previousGeneration: string;
  fastEconomical: string;
  
  // Pricing
  supportStudorama: string;
  supportStudoramaDesc: string;
  freeForever: string;
  freeForeverDesc: string;
  noAccountRequired: string;
  startLearningImmediately: string;
  noAccountRequiredDesc: string;
  monthlySponsorship: string;
  supportFreeEducation: string;
  helpImprovePlatform: string;
  recognitionAsSupporter: string;
  helpKeepPlatformAccountless: string;
  becomeSupporter: string;
  externalCheckout: string;
  accountOptional: string;
  whySponsorStudorama: string;
  keepItFree: string;
  keepItFreeDesc: string;
  fundDevelopment: string;
  fundDevelopmentDesc: string;
  serverCosts: string;
  serverCostsDesc: string;
  privacyFirst: string;
  privacyFirstDesc: string;
  startLearningInstantly: string;
  noBarriersToLearning: string;
  noEmailRequired: string;
  noPasswordToRemember: string;
  noVerificationSteps: string;
  noPersonalDataCollection: string;
  startStudyingInSeconds: string;
  privacyFocused: string;
  dataStaysInBrowser: string;
  noTrackingOrAnalytics: string;
  yourApiKeyStaysLocal: string;
  completeAnonymity: string;
  gdprCompliantByDesign: string;
  transparencyTrust: string;
  transparencyTrustDesc: string;
  mostPopular: string;
  advanced: string;
  standard: string;
  basic: string;
  advancedDesc: string;
  standardDesc: string;
  basicDesc: string;
  
  // Theme Support
  theme: string;
  themes: string;
  appearance: string;
  selectTheme: string;
  themeSettings: string;
  customizeAppearance: string;
  
  // API Key Notifications
  apiKeyConfigured: string;
  apiKeyConfiguredDesc: string;
  invalidApiKey: string;
  invalidApiKeyDesc: string;
  apiKeyFromUrl: string;
  apiKeyPreserved: string;
  
  // Version Control
  appUpdated: string;
  versionUpdated: string;
  dataRefreshed: string;
  initializingApp: string;
  checkingUpdates: string;
  
  // Common
  loading: string;
  error: string;
  retry: string;
  delete: string;
  edit: string;
  close: string;
  yes: string;
  no: string;
  save: string;
}