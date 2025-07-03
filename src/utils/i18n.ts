import { Language } from '../types';

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
  rememberChoiceDescription: string;
  confirmChange: string;
  cancel: string;
  languageSwitchPreferences: string;
  manageLanguagePreferences: string;
  resetLanguagePreferences: string;
  languagePreferencesReset: string;
  
  // OpenAI Models
  gpt4oRecommended: string;
  gpt4oMini: string;
  gpt4Turbo: string;
  gpt4: string;
  gpt35Turbo: string;
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

// Random modifier placeholders
const MODIFIER_PLACEHOLDERS = {
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
    'Microeconomics by Paul Krugman',
    'The Art of Computer Programming by Donald Knuth',
    'Database Systems by Ramez Elmasri',
    'Operating System Concepts by Abraham Silberschatz',
    'Computer Networks by Andrew Tanenbaum',
    'Artificial Intelligence: A Modern Approach by Stuart Russell'
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
    'Microeconomia por Paul Krugman',
    'A Arte da Programação de Computadores por Donald Knuth',
    'Sistemas de Banco de Dados por Ramez Elmasri',
    'Conceitos de Sistemas Operacionais por Abraham Silberschatz',
    'Redes de Computadores por Andrew Tanenbaum',
    'Inteligência Artificial: Uma Abordagem Moderna por Stuart Russell'
  ]
};

export function getRandomModifierPlaceholder(language: Language): string {
  const placeholders = MODIFIER_PLACEHOLDERS[language] || MODIFIER_PLACEHOLDERS['en-US'];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}

const translations: Record<Language, Translations> = {
  'en-US': {
    // Navigation
    dashboard: 'Dashboard',
    study: 'Study',
    history: 'History',
    settings: 'Settings',
    
    // Dashboard
    welcomeTitle: 'Welcome to Studorama',
    welcomeSubtitle: 'AI-powered study sessions to enhance your learning',
    setupRequired: 'Setup Required:',
    configureApiKey: 'Please configure your OpenAI API key in',
    readyToStudy: 'Ready to study!',
    usingModel: 'Using OpenAI model:',
    totalSessions: 'Total Sessions',
    completed: 'Completed',
    averageScore: 'Average Score',
    startNewSession: 'Start New Session',
    beginNewSession: 'Begin a new AI-powered study session',
    viewHistory: 'View History',
    reviewPastSessions: 'Review your past study sessions',
    recentSessions: 'Recent Sessions',
    questions: 'questions',
    inProgress: 'In Progress',
    score: 'score',
    
    // Study Session
    startNewStudySession: 'Start New Study Session',
    configureSession: 'Configure your AI-powered study session with proven learning techniques',
    studySubject: 'Study Subject',
    subjectPlaceholder: 'e.g., JavaScript, World History, Biology...',
    subjectModifiers: 'Subject Modifiers (Optional)',
    subjectModifiersPlaceholder: 'e.g., Discrete Mathematical Structures with Applications to Computer Science by JP Tremblay R Manohar',
    addModifier: 'Add Modifier',
    removeModifier: 'Remove',
    questionType: 'Question Type',
    multipleChoice: 'Multiple Choice',
    quickAssessment: 'Quick assessment questions',
    dissertative: 'Dissertative',
    deepAnalysis: 'Deep analysis questions',
    mixed: 'Mixed',
    interleavedPractice: 'Interleaved practice',
    learningTechniques: 'Learning Techniques',
    makeItStickBased: 'Based on "Make It Stick"',
    spacedRepetitionDesc: 'Review questions at increasing intervals',
    interleavingDesc: 'Mix different question types for better retention',
    elaborativeInterrogationDesc: 'Ask "why" questions for deeper understanding',
    retrievalPracticeDesc: 'Test yourself to strengthen memory',
    rememberMyChoice: 'Remember my choice',
    rememberLearningTechniques: 'Use these learning technique preferences as default values when creating new study sessions',
    readyToLearn: 'Ready to learn!',
    startEnhancedSession: 'Start Enhanced Study Session',
    configureApiKeyFirst: 'Please configure your OpenAI API key in Settings first.',
    generatingQuestion: 'Generating your next question...',
    using: 'Using',
    currentScore: 'Current Score',
    question: 'Question',
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
    confidenceQuestion: 'How confident are you in your answer?',
    notConfident: 'Not confident',
    veryConfident: 'Very confident',
    excellent: 'Excellent!',
    keepLearning: 'Keep Learning!',
    aiEvaluation: 'AI Evaluation:',
    modelAnswer: 'Model Answer:',
    elaborativePrompt: 'Elaborative Interrogation: Why do you think this is the correct answer?',
    explainReasoning: 'Explain your reasoning and why this answer makes sense...',
    selfExplanationPrompt: 'Self-Explanation: How does this connect to what you already know?',
    connectKnowledge: 'Connect this answer to your existing knowledge or other concepts...',
    endSession: 'End Session',
    submitAnswer: 'Submit Answer',
    evaluating: 'Evaluating...',
    tryAgain: 'Try Again',
    nextQuestion: 'Next Question',
    
    // Session History
    studyHistory: 'Study History',
    reviewProgress: 'Review your past study sessions and progress',
    newSession: 'New Session',
    noSessionsYet: 'No Study Sessions Yet',
    startFirstSession: 'Start First Session',
    allSessions: 'All Sessions',
    questionsAnswered: 'Questions Answered',
    date: 'Date',
    accuracy: 'Accuracy',
    continue: 'Continue',
    viewDetails: 'View Details',
    correctAnswers: 'Correct Answers',
    deleteAllSessions: 'Delete All Sessions',
    deleteAllSessionsConfirm: 'Are you sure you want to delete all study sessions? This action cannot be undone.',
    deleteAllSessionsWarning: 'This will permanently delete all your study sessions, progress, and history.',
    sessionsDeleted: 'All sessions have been deleted successfully.',
    
    // Session Details
    sessionNotFound: 'Session Not Found',
    sessionNotFoundDesc: "The study session you're looking for doesn't exist.",
    backToHistory: 'Back to History',
    sessionDetails: 'Study Session Details',
    questionsAndAnswers: 'Questions & Answers',
    correct: 'Correct',
    yourAnswer: 'Your Answer',
    feedback: 'Feedback:',
    attempts: 'attempts',
    attempt: 'attempt',
    continueSession: 'Continue Session',
    
    // Settings
    settingsTitle: 'Settings',
    configurePreferences: 'Configure your Studorama preferences and learning techniques',
    apiConfiguration: 'API Configuration',
    openaiApiConfig: 'Configure your OpenAI API key and model preferences',
    openaiApiKey: 'OpenAI API Key',
    apiKeyStored: 'Your API key is stored locally in your browser and never shared with anyone.',
    openaiModel: 'OpenAI Model',
    howToGetApiKey: 'How to get your OpenAI API Key:',
    openaiPlatform: 'Visit',
    signInOrCreate: 'Sign in or create an account',
    createSecretKey: 'Click "Create new secret key"',
    copyPasteKey: 'Copy and paste the key here',
    aiPrompts: 'AI Prompts',
    aiPromptsCustomization: 'AI Prompts Customization',
    customizeGeneration: 'Customize how the AI generates and evaluates questions',
    resetToDefaults: 'Reset to Defaults',
    multipleChoicePrompt: 'Multiple Choice Questions Prompt',
    dissertativePrompt: 'Dissertative Questions Prompt',
    answerEvaluationPrompt: 'Answer Evaluation Prompt',
    elaborativeInterrogationPrompt: 'Elaborative Interrogation Prompt',
    retrievalPracticePrompt: 'Retrieval Practice Prompt',
    subjectPlaceholder2: 'Use {subject} as a placeholder for the study subject.',
    questionPlaceholder: 'Use {question}, {userAnswer}',
    userAnswerPlaceholder: ', and {modelAnswer}',
    modelAnswerPlaceholder: 'as placeholders.',
    learningTechniquesTab: 'Learning Techniques',
    learningTechniquesSettings: 'Learning Techniques Settings',
    manageLearningTechniques: 'Manage your default learning technique preferences',
    defaultLearningTechniques: 'Default Learning Techniques',
    rememberChoiceForSessions: 'Remember choice for new sessions',
    rememberChoiceDescription: 'When enabled, new study sessions will automatically use these learning techniques without showing the selection interface.',
    unsetRememberChoice: 'Unset "Remember Choice"',
    makeItStickScience: 'Based on "Make It Stick: The Science of Successful Learning"',
    spacedRepetition: 'Spaced Repetition',
    spacedRepetitionFull: 'Review material at increasing intervals to strengthen long-term retention. Questions are automatically scheduled for review based on your performance.',
    spacedRepetitionHow: 'Correctly answered questions are reviewed after longer intervals, while missed questions are reviewed sooner.',
    interleaving: 'Interleaving',
    interleavingFull: 'Mix different types of questions and topics rather than studying one type at a time. This improves discrimination and transfer of learning.',
    interleavingHow: 'When "Mixed" question type is selected, multiple choice and dissertative questions are randomly interleaved.',
    elaborativeInterrogation: 'Elaborative Interrogation',
    elaborativeInterrogationFull: 'Ask "why" questions to understand the reasoning behind facts and concepts. This creates deeper understanding and better retention.',
    elaborativeInterrogationHow: 'After incorrect answers, you\'ll be prompted to explain why the correct answer makes sense.',
    selfExplanation: 'Self-Explanation',
    selfExplanationFull: 'Explain how new information relates to what you already know. This builds connections and improves understanding.',
    selfExplanationHow: 'After correct answers, you\'ll be prompted to connect the concept to your existing knowledge.',
    desirableDifficulties: 'Desirable Difficulties',
    desirableDifficultiesFull: 'Introduce appropriate challenges that require effort but are achievable. This strengthens learning and retention.',
    desirableDifficultiesHow: 'Some questions are made more challenging to promote deeper thinking and stronger memory formation.',
    retrievalPractice: 'Retrieval Practice',
    retrievalPracticeFull: 'Test yourself frequently to strengthen memory pathways. The act of retrieving information makes it more memorable.',
    retrievalPracticeHow: 'Questions test your ability to recall information, and confidence levels help track your certainty.',
    researchBasedBenefits: 'Research-Based Benefits',
    improvedRetention: 'These techniques can improve long-term retention by 50-200%',
    betterTransfer: 'Knowledge gained through these methods transfers better to new situations',
    deeperUnderstanding: 'Focus on comprehension rather than just memorization',
    metacognitiveAwareness: 'Better understanding of what you know and don\'t know',
    language: 'Language',
    selectLanguage: 'Select your preferred language',
    about: 'About',
    aboutStudorama: 'About Studorama',
    aiPoweredPlatform: 'AI-powered study sessions with proven learning techniques',
    createdBy: 'Created by oluiscabral',
    studoramaDescription: 'Studorama combines cutting-edge AI technology with research-backed learning techniques from "Make It Stick" to create the most effective study experience possible. Transform your learning with spaced repetition, interleaving, and other proven methods.',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    coreFeatures: 'Core Features',
    aiGeneratedQuestions: 'AI-generated questions (multiple choice & dissertative)',
    mixedQuestionTypes: 'Mixed question types with interleaving',
    spacedRepetitionScheduling: 'Spaced repetition scheduling',
    elaborativePrompts: 'Elaborative interrogation prompts',
    selfExplanationExercises: 'Self-explanation exercises',
    confidenceTracking: 'Confidence tracking',
    sessionHistoryAnalytics: 'Session history & analytics',
    learningScience: 'Learning Science',
    makeItStickResearch: 'Based on "Make It Stick" research',
    retrievalPracticeImplementation: 'Retrieval practice implementation',
    desirableDifficultiesIntegration: 'Desirable difficulties integration',
    generationEffectUtilization: 'Generation effect utilization',
    metacognitiveStrategyTraining: 'Metacognitive strategy training',
    evidenceBasedSpacing: 'Evidence-based spacing algorithms',
    cognitiveLoadOptimization: 'Cognitive load optimization',
    privacySecurity: 'Privacy & Security',
    privacyDescription: 'Your API key and study data are stored locally in your browser and are never transmitted to our servers. Only you have access to your study sessions and progress. Your API key is used solely to communicate with OpenAI\'s services to generate study questions and evaluations.',
    scientificFoundation: 'Scientific Foundation',
    scientificDescription: 'Studorama implements learning techniques validated by cognitive science research, particularly from "Make It Stick: The Science of Successful Learning" by Peter C. Brown, Henry L. Roediger III, and Mark A. McDaniel. These methods have been proven to enhance long-term retention and transfer of knowledge.',
    openSourceProject: 'Open Source Project',
    openSourceDescription: 'Studorama is completely open source and available on GitHub. You can view the code, contribute improvements, report issues, or fork the project for your own use.',
    viewOnGitHub: 'View on GitHub',
    contributeToProject: 'Contribute to Project',
    reportIssue: 'Report Issue',
    requestFeature: 'Request Feature',
    saveSettings: 'Save Settings',
    saved: 'Saved!',
    configurationStatus: 'Configuration Status',
    configured: 'Configured',
    notConfigured: 'Not Configured',
    selectedModel: 'Selected Model',
    enhancedStudyMode: 'Enhanced Study Mode',
    ready: 'Ready',
    requiresApiKey: 'Requires API Key',
    
    // Data Management
    dataManagement: 'Data Management',
    manageYourData: 'Manage your Studorama data and privacy',
    deleteAllData: 'Delete All Data',
    deleteAllDataConfirm: 'Are you sure you want to delete ALL your Studorama data? This includes sessions, settings, API keys, and preferences.',
    deleteAllDataWarning: 'This will permanently delete everything and reset Studorama to its initial state. This action cannot be undone.',
    allDataDeleted: 'All data has been deleted successfully. Studorama has been reset.',
    deleteAllDataDesc: 'Permanently delete all your study sessions, settings, API keys, and preferences',
    
    // Language Switch Modal
    languageChange: 'Language Change',
    resetPromptsOption: 'Reset AI prompts for the new language',
    resetPromptsDescription: 'Recommended: Automatically updates all AI prompts to match the selected language, ensuring questions and evaluations are generated in the correct language.',
    rememberChoice: 'Remember my choice',
    rememberChoiceDescription: 'Don\'t show this dialog again when switching languages. You can change this preference in settings.',
    confirmChange: 'Confirm Change',
    cancel: 'Cancel',
    languageSwitchPreferences: 'Language Switch Preferences',
    manageLanguagePreferences: 'Manage Language Switch Preferences',
    resetLanguagePreferences: 'Reset Language Preferences',
    languagePreferencesReset: 'Language preferences have been reset. The dialog will appear again when switching languages.',
    
    // OpenAI Models
    gpt4oRecommended: 'GPT-4o (Recommended)',
    gpt4oMini: 'GPT-4o Mini',
    gpt4Turbo: 'GPT-4 Turbo',
    gpt4: 'GPT-4',
    gpt35Turbo: 'GPT-3.5 Turbo',
    latestMostCapable: 'Latest and most capable model',
    fasterCostEffective: 'Faster and more cost-effective',
    highPerformance: 'High performance model',
    previousGeneration: 'Previous generation flagship model',
    fastEconomical: 'Fast and economical',
    
    // Pricing
    supportStudorama: 'Support Studorama',
    supportStudoramaDesc: 'Studorama is completely free to use and always will be. Your sponsorship helps us maintain and improve the platform for everyone.',
    freeForever: '100% Free Forever',
    freeForeverDesc: 'All features are available to everyone at no cost. No account required! Sponsorships help us keep it that way.',
    noAccountRequired: 'No Account Required!',
    startLearningImmediately: 'Start learning immediately',
    noAccountRequiredDesc: 'Studorama works completely without creating an account. Your study sessions are saved locally in your browser. All AI-powered features, spaced repetition, and learning techniques are available instantly.',
    monthlySponsorship: 'Monthly sponsorship',
    supportFreeEducation: 'Support free education for everyone',
    helpImprovePlatform: 'Help improve platform features',
    recognitionAsSupporter: 'Recognition as a supporter',
    helpKeepPlatformAccountless: 'Help keep the platform accountless',
    becomeSupporter: 'Become a',
    externalCheckout: 'External checkout',
    accountOptional: 'account optional',
    whySponsorStudorama: 'Why Sponsor Studorama?',
    keepItFree: 'Keep It Free',
    keepItFreeDesc: 'Help us maintain Studorama as a completely free, accountless platform for all learners worldwide.',
    fundDevelopment: 'Fund Development',
    fundDevelopmentDesc: 'Support ongoing development of new features and improvements to enhance learning.',
    serverCosts: 'Server Costs',
    serverCostsDesc: 'Cover hosting, AI API costs, and infrastructure to keep the platform running smoothly.',
    privacyFirst: 'Privacy First',
    privacyFirstDesc: 'Support a platform that respects privacy by not requiring accounts or collecting personal data.',
    startLearningInstantly: 'Start Learning Instantly',
    noBarriersToLearning: 'No Barriers to Learning',
    noEmailRequired: 'No email required',
    noPasswordToRemember: 'No password to remember',
    noVerificationSteps: 'No verification steps',
    noPersonalDataCollection: 'No personal data collection',
    startStudyingInSeconds: 'Start studying in seconds',
    privacyFocused: 'Privacy Focused',
    dataStaysInBrowser: 'Data stays in your browser',
    noTrackingOrAnalytics: 'No tracking or analytics',
    yourApiKeyStaysLocal: 'Your API key stays local',
    completeAnonymity: 'Complete anonymity',
    gdprCompliantByDesign: 'GDPR compliant by design',
    transparencyTrust: 'Transparency & Trust',
    transparencyTrustDesc: 'Your sponsorship goes directly to: Server hosting costs, OpenAI API usage, development time, and platform maintenance. We believe in keeping education accessible to everyone, regardless of their financial situation or willingness to create accounts. Studorama will always remain free and accountless.',
    mostPopular: 'Most Popular',
    advanced: 'Advanced',
    standard: 'Standard',
    basic: 'Basic',
    advancedDesc: 'Support Studorama development with a generous monthly contribution. Help us maintain and improve the platform for everyone.',
    standardDesc: 'Show your appreciation with a monthly contribution. Every bit helps us keep Studorama free and accessible.',
    basicDesc: 'Buy us a coffee each month! A small gesture that makes a big difference in supporting our mission.',
    
    // Theme Support
    theme: 'Theme',
    themes: 'Themes',
    appearance: 'Appearance',
    selectTheme: 'Select Theme',
    themeSettings: 'Theme Settings',
    customizeAppearance: 'Customize the appearance of Studorama',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
  },
  
  'pt-BR': {
    // Navigation
    dashboard: 'Painel',
    study: 'Estudar',
    history: 'Histórico',
    settings: 'Configurações',
    
    // Dashboard
    welcomeTitle: 'Bem-vindo ao Studorama',
    welcomeSubtitle: 'Sessões de estudo com IA para aprimorar seu aprendizado',
    setupRequired: 'Configuração Necessária:',
    configureApiKey: 'Configure sua chave da API OpenAI em',
    readyToStudy: 'Pronto para estudar!',
    usingModel: 'Usando modelo OpenAI:',
    totalSessions: 'Total de Sessões',
    completed: 'Concluídas',
    averageScore: 'Pontuação Média',
    startNewSession: 'Iniciar Nova Sessão',
    beginNewSession: 'Iniciar uma nova sessão de estudo com IA',
    viewHistory: 'Ver Histórico',
    reviewPastSessions: 'Revisar suas sessões de estudo anteriores',
    recentSessions: 'Sessões Recentes',
    questions: 'questões',
    inProgress: 'Em Andamento',
    score: 'pontuação',
    
    // Study Session
    startNewStudySession: 'Iniciar Nova Sessão de Estudo',
    configureSession: 'Configure sua sessão de estudo com IA usando técnicas de aprendizado comprovadas',
    studySubject: 'Matéria de Estudo',
    subjectPlaceholder: 'ex: JavaScript, História Mundial, Biologia...',
    subjectModifiers: 'Modificadores da Matéria (Opcional)',
    subjectModifiersPlaceholder: 'ex: Estruturas Matemáticas Discretas com Aplicações à Ciência da Computação por JP Tremblay R Manohar',
    addModifier: 'Adicionar Modificador',
    removeModifier: 'Remover',
    questionType: 'Tipo de Questão',
    multipleChoice: 'Múltipla Escolha',
    quickAssessment: 'Questões de avaliação rápida',
    dissertative: 'Dissertativa',
    deepAnalysis: 'Questões de análise profunda',
    mixed: 'Misto',
    interleavedPractice: 'Prática intercalada',
    learningTechniques: 'Técnicas de Aprendizado',
    makeItStickBased: 'Baseado em "Make It Stick"',
    spacedRepetitionDesc: 'Revisar questões em intervalos crescentes',
    interleavingDesc: 'Misturar diferentes tipos de questões para melhor retenção',
    elaborativeInterrogationDesc: 'Fazer perguntas "por que" para compreensão mais profunda',
    retrievalPracticeDesc: 'Testar-se para fortalecer a memória',
    rememberMyChoice: 'Lembrar minha escolha',
    rememberLearningTechniques: 'Usar essas preferências de técnicas de aprendizado como valores padrão ao criar novas sessões de estudo',
    readyToLearn: 'Pronto para aprender!',
    startEnhancedSession: 'Iniciar Sessão de Estudo Aprimorada',
    configureApiKeyFirst: 'Configure sua chave da API OpenAI nas Configurações primeiro.',
    generatingQuestion: 'Gerando sua próxima questão...',
    using: 'Usando',
    currentScore: 'Pontuação Atual',
    question: 'Questão',
    easy: 'fácil',
    medium: 'médio',
    hard: 'difícil',
    confidenceQuestion: 'Quão confiante você está na sua resposta?',
    notConfident: 'Pouco confiante',
    veryConfident: 'Muito confiante',
    excellent: 'Excelente!',
    keepLearning: 'Continue Aprendendo!',
    aiEvaluation: 'Avaliação da IA:',
    modelAnswer: 'Resposta Modelo:',
    elaborativePrompt: 'Interrogação Elaborativa: Por que você acha que esta é a resposta correta?',
    explainReasoning: 'Explique seu raciocínio e por que esta resposta faz sentido...',
    selfExplanationPrompt: 'Auto-Explicação: Como isso se conecta ao que você já sabe?',
    connectKnowledge: 'Conecte esta resposta ao seu conhecimento existente ou outros conceitos...',
    endSession: 'Finalizar Sessão',
    submitAnswer: 'Enviar Resposta',
    evaluating: 'Avaliando...',
    tryAgain: 'Tentar Novamente',
    nextQuestion: 'Próxima Questão',
    
    // Session History
    studyHistory: 'Histórico de Estudos',
    reviewProgress: 'Revise suas sessões de estudo anteriores e progresso',
    newSession: 'Nova Sessão',
    noSessionsYet: 'Ainda Não Há Sessões de Estudo',
    startFirstSession: 'Iniciar Primeira Sessão',
    allSessions: 'Todas as Sessões',
    questionsAnswered: 'Questões Respondidas',
    date: 'Data',
    accuracy: 'Precisão',
    continue: 'Continuar',
    viewDetails: 'Ver Detalhes',
    correctAnswers: 'Respostas Corretas',
    deleteAllSessions: 'Excluir Todas as Sessões',
    deleteAllSessionsConfirm: 'Tem certeza de que deseja excluir todas as sessões de estudo? Esta ação não pode ser desfeita.',
    deleteAllSessionsWarning: 'Isso excluirá permanentemente todas as suas sessões de estudo, progresso e histórico.',
    sessionsDeleted: 'Todas as sessões foram excluídas com sucesso.',
    
    // Session Details
    sessionNotFound: 'Sessão Não Encontrada',
    sessionNotFoundDesc: 'A sessão de estudo que você está procurando não existe.',
    backToHistory: 'Voltar ao Histórico',
    sessionDetails: 'Detalhes da Sessão de Estudo',
    questionsAndAnswers: 'Questões e Respostas',
    correct: 'Correto',
    yourAnswer: 'Sua Resposta',
    feedback: 'Feedback:',
    attempts: 'tentativas',
    attempt: 'tentativa',
    continueSession: 'Continuar Sessão',
    
    // Settings
    settingsTitle: 'Configurações',
    configurePreferences: 'Configure suas preferências do Studorama e técnicas de aprendizado',
    apiConfiguration: 'Configuração da API',
    openaiApiConfig: 'Configure sua chave da API OpenAI e preferências de modelo',
    openaiApiKey: 'Chave da API OpenAI',
    apiKeyStored: 'Sua chave da API é armazenada localmente no seu navegador e nunca é compartilhada.',
    openaiModel: 'Modelo OpenAI',
    howToGetApiKey: 'Como obter sua Chave da API OpenAI:',
    openaiPlatform: 'Visite a',
    signInOrCreate: 'Faça login ou crie uma conta',
    createSecretKey: 'Clique em "Create new secret key"',
    copyPasteKey: 'Copie e cole a chave aqui',
    aiPrompts: 'Prompts da IA',
    aiPromptsCustomization: 'Personalização de Prompts da IA',
    customizeGeneration: 'Personalize como a IA gera e avalia questões',
    resetToDefaults: 'Restaurar Padrões',
    multipleChoicePrompt: 'Prompt para Questões de Múltipla Escolha',
    dissertativePrompt: 'Prompt para Questões Dissertativas',
    answerEvaluationPrompt: 'Prompt para Avaliação de Respostas',
    elaborativeInterrogationPrompt: 'Prompt para Interrogação Elaborativa',
    retrievalPracticePrompt: 'Prompt para Prática de Recuperação',
    subjectPlaceholder2: 'Use {subject} como placeholder para a matéria de estudo.',
    questionPlaceholder: 'Use {question}, {userAnswer}',
    userAnswerPlaceholder: ', e {modelAnswer}',
    modelAnswerPlaceholder: 'como placeholders.',
    learningTechniquesTab: 'Técnicas de Aprendizado',
    learningTechniquesSettings: 'Configurações de Técnicas de Aprendizado',
    manageLearningTechniques: 'Gerencie suas preferências padrão de técnicas de aprendizado',
    defaultLearningTechniques: 'Técnicas de Aprendizado Padrão',
    rememberChoiceForSessions: 'Lembrar escolha para novas sessões',
    rememberChoiceDescription: 'Quando habilitado, novas sessões de estudo usarão automaticamente essas técnicas de aprendizado sem mostrar a interface de seleção.',
    unsetRememberChoice: 'Desmarcar "Lembrar Escolha"',
    makeItStickScience: 'Baseado em "Make It Stick: The Science of Successful Learning"',
    spacedRepetition: 'Repetição Espaçada',
    spacedRepetitionFull: 'Revise material em intervalos crescentes para fortalecer a retenção a longo prazo. As questões são automaticamente agendadas para revisão baseado no seu desempenho.',
    spacedRepetitionHow: 'Questões respondidas corretamente são revisadas após intervalos maiores, enquanto questões perdidas são revisadas mais cedo.',
    interleaving: 'Intercalação',
    interleavingFull: 'Misture diferentes tipos de questões e tópicos em vez de estudar um tipo por vez. Isso melhora a discriminação e transferência do aprendizado.',
    interleavingHow: 'Quando o tipo de questão "Misto" é selecionado, questões de múltipla escolha e dissertativas são intercaladas aleatoriamente.',
    elaborativeInterrogation: 'Interrogação Elaborativa',
    elaborativeInterrogationFull: 'Faça perguntas "por que" para entender o raciocínio por trás de fatos e conceitos. Isso cria compreensão mais profunda e melhor retenção.',
    elaborativeInterrogationHow: 'Após respostas incorretas, você será solicitado a explicar por que a resposta correta faz sentido.',
    selfExplanation: 'Auto-Explicação',
    selfExplanationFull: 'Explique como novas informações se relacionam com o que você já sabe. Isso constrói conexões e melhora a compreensão.',
    selfExplanationHow: 'Após respostas corretas, você será solicitado a conectar o conceito ao seu conhecimento existente.',
    desirableDifficulties: 'Dificuldades Desejáveis',
    desirableDifficultiesFull: 'Introduza desafios apropriados que requerem esforço mas são alcançáveis. Isso fortalece o aprendizado e retenção.',
    desirableDifficultiesHow: 'Algumas questões são tornadas mais desafiadoras para promover pensamento mais profundo e formação de memória mais forte.',
    retrievalPractice: 'Prática de Recuperação',
    retrievalPracticeFull: 'Teste-se frequentemente para fortalecer caminhos de memória. O ato de recuperar informação a torna mais memorável.',
    retrievalPracticeHow: 'Questões testam sua habilidade de lembrar informações, e níveis de confiança ajudam a rastrear sua certeza.',
    researchBasedBenefits: 'Benefícios Baseados em Pesquisa',
    improvedRetention: 'Essas técnicas podem melhorar a retenção a longo prazo em 50-200%',
    betterTransfer: 'Conhecimento adquirido através desses métodos se transfere melhor para novas situações',
    deeperUnderstanding: 'Foco na compreensão em vez de apenas memorização',
    metacognitiveAwareness: 'Melhor compreensão do que você sabe e não sabe',
    language: 'Idioma',
    selectLanguage: 'Selecione seu idioma preferido',
    about: 'Sobre',
    aboutStudorama: 'Sobre o Studorama',
    aiPoweredPlatform: 'Sessões de estudo com IA e técnicas de aprendizado comprovadas',
    createdBy: 'Criado por oluiscabral',
    studoramaDescription: 'O Studorama combina tecnologia de IA de ponta com técnicas de aprendizado baseadas em pesquisa do "Make It Stick" para criar a experiência de estudo mais eficaz possível. Transforme seu aprendizado com repetição espaçada, intercalação e outros métodos comprovados.',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    coreFeatures: 'Recursos Principais',
    aiGeneratedQuestions: 'Questões geradas por IA (múltipla escolha e dissertativas)',
    mixedQuestionTypes: 'Tipos de questões mistas com intercalação',
    spacedRepetitionScheduling: 'Agendamento de repetição espaçada',
    elaborativePrompts: 'Prompts de interrogação elaborativa',
    selfExplanationExercises: 'Exercícios de auto-explicação',
    confidenceTracking: 'Rastreamento de confiança',
    sessionHistoryAnalytics: 'Histórico de sessões e análises',
    learningScience: 'Ciência do Aprendizado',
    makeItStickResearch: 'Baseado na pesquisa "Make It Stick"',
    retrievalPracticeImplementation: 'Implementação de prática de recuperação',
    desirableDifficultiesIntegration: 'Integração de dificuldades desejáveis',
    generationEffectUtilization: 'Utilização do efeito de geração',
    metacognitiveStrategyTraining: 'Treinamento de estratégia metacognitiva',
    evidenceBasedSpacing: 'Algoritmos de espaçamento baseados em evidência',
    cognitiveLoadOptimization: 'Otimização de carga cognitiva',
    privacySecurity: 'Privacidade e Segurança',
    privacyDescription: 'Sua chave da API e dados de estudo são armazenados localmente no seu navegador e nunca são transmitidos para nossos servidores. Apenas você tem acesso às suas sessões de estudo e progresso. Sua chave da API é usada apenas para se comunicar com os serviços da OpenAI para gerar questões e avaliações de estudo.',
    scientificFoundation: 'Fundação Científica',
    scientificDescription: 'O Studorama implementa técnicas de aprendizado validadas pela pesquisa em ciência cognitiva, particularmente do "Make It Stick: The Science of Successful Learning" por Peter C. Brown, Henry L. Roediger III, e Mark A. McDaniel. Esses métodos foram comprovados para melhorar a retenção a longo prazo e transferência de conhecimento.',
    openSourceProject: 'Projeto de Código Aberto',
    openSourceDescription: 'O Studorama é completamente de código aberto e está disponível no GitHub. Você pode visualizar o código, contribuir com melhorias, relatar problemas ou fazer fork do projeto para seu próprio uso.',
    viewOnGitHub: 'Ver no GitHub',
    contributeToProject: 'Contribuir para o Projeto',
    reportIssue: 'Relatar Problema',
    requestFeature: 'Solicitar Recurso',
    saveSettings: 'Salvar Configurações',
    saved: 'Salvo!',
    configurationStatus: 'Status da Configuração',
    configured: 'Configurado',
    notConfigured: 'Não Configurado',
    selectedModel: 'Modelo Selecionado',
    enhancedStudyMode: 'Modo de Estudo Aprimorado',
    ready: 'Pronto',
    requiresApiKey: 'Requer Chave da API',
    
    // Data Management
    dataManagement: 'Gerenciamento de Dados',
    manageYourData: 'Gerencie seus dados do Studorama e privacidade',
    deleteAllData: 'Excluir Todos os Dados',
    deleteAllDataConfirm: 'Tem certeza de que deseja excluir TODOS os seus dados do Studorama? Isso inclui sessões, configurações, chaves da API e preferências.',
    deleteAllDataWarning: 'Isso excluirá permanentemente tudo e redefinirá o Studorama ao seu estado inicial. Esta ação não pode ser desfeita.',
    allDataDeleted: 'Todos os dados foram excluídos com sucesso. O Studorama foi redefinido.',
    deleteAllDataDesc: 'Excluir permanentemente todas as suas sessões de estudo, configurações, chaves da API e preferências',
    
    // Language Switch Modal
    languageChange: 'Alteração de Idioma',
    resetPromptsOption: 'Redefinir prompts da IA para o novo idioma',
    resetPromptsDescription: 'Recomendado: Atualiza automaticamente todos os prompts da IA para corresponder ao idioma selecionado, garantindo que as questões e avaliações sejam geradas no idioma correto.',
    rememberChoice: 'Lembrar minha escolha',
    rememberChoiceDescription: 'Não mostrar este diálogo novamente ao trocar de idioma. Você pode alterar esta preferência nas configurações.',
    confirmChange: 'Confirmar Alteração',
    cancel: 'Cancelar',
    languageSwitchPreferences: 'Preferências de Troca de Idioma',
    manageLanguagePreferences: 'Gerenciar Preferências de Troca de Idioma',
    resetLanguagePreferences: 'Redefinir Preferências de Idioma',
    languagePreferencesReset: 'As preferências de idioma foram redefinidas. O diálogo aparecerá novamente ao trocar de idioma.',
    
    // OpenAI Models
    gpt4oRecommended: 'GPT-4o (Recomendado)',
    gpt4oMini: 'GPT-4o Mini',
    gpt4Turbo: 'GPT-4 Turbo',
    gpt4: 'GPT-4',
    gpt35Turbo: 'GPT-3.5 Turbo',
    latestMostCapable: 'Modelo mais recente e capaz',
    fasterCostEffective: 'Mais rápido e econômico',
    highPerformance: 'Modelo de alta performance',
    previousGeneration: 'Modelo principal da geração anterior',
    fastEconomical: 'Rápido e econômico',
    
    // Pricing
    supportStudorama: 'Apoie o Studorama',
    supportStudoramaDesc: 'O Studorama é completamente gratuito para usar e sempre será. Seu apoio nos ajuda a manter e melhorar a plataforma para todos.',
    freeForever: '100% Gratuito Para Sempre',
    freeForeverDesc: 'Todos os recursos estão disponíveis para todos sem custo. Nenhuma conta necessária! Os apoios nos ajudam a manter assim.',
    noAccountRequired: 'Nenhuma Conta Necessária!',
    startLearningImmediately: 'Comece a aprender imediatamente',
    noAccountRequiredDesc: 'O Studorama funciona completamente sem criar uma conta. Suas sessões de estudo são salvas localmente no seu navegador. Todos os recursos com IA, repetição espaçada e técnicas de aprendizado estão disponíveis instantaneamente.',
    monthlySponsorship: 'Apoio mensal',
    supportFreeEducation: 'Apoie educação gratuita para todos',
    helpImprovePlatform: 'Ajude a melhorar os recursos da plataforma',
    recognitionAsSupporter: 'Reconhecimento como apoiador',
    helpKeepPlatformAccountless: 'Ajude a manter a plataforma sem necessidade de conta',
    becomeSupporter: 'Torne-se um',
    externalCheckout: 'Checkout externo',
    accountOptional: 'conta opcional',
    whySponsorStudorama: 'Por que Apoiar o Studorama?',
    keepItFree: 'Manter Gratuito',
    keepItFreeDesc: 'Nos ajude a manter o Studorama como uma plataforma completamente gratuita e sem necessidade de conta para todos os estudantes do mundo.',
    fundDevelopment: 'Financiar Desenvolvimento',
    fundDevelopmentDesc: 'Apoie o desenvolvimento contínuo de novos recursos e melhorias para aprimorar o aprendizado.',
    serverCosts: 'Custos do Servidor',
    serverCostsDesc: 'Cubra hospedagem, custos da API de IA e infraestrutura para manter a plataforma funcionando perfeitamente.',
    privacyFirst: 'Privacidade Primeiro',
    privacyFirstDesc: 'Apoie uma plataforma que respeita a privacidade ao não exigir contas ou coletar dados pessoais.',
    startLearningInstantly: 'Comece a Aprender Instantaneamente',
    noBarriersToLearning: 'Sem Barreiras ao Aprendizado',
    noEmailRequired: 'Nenhum email necessário',
    noPasswordToRemember: 'Nenhuma senha para lembrar',
    noVerificationSteps: 'Nenhuma etapa de verificação',
    noPersonalDataCollection: 'Nenhuma coleta de dados pessoais',
    startStudyingInSeconds: 'Comece a estudar em segundos',
    privacyFocused: 'Focado na Privacidade',
    dataStaysInBrowser: 'Dados ficam no seu navegador',
    noTrackingOrAnalytics: 'Sem rastreamento ou análises',
    yourApiKeyStaysLocal: 'Sua chave da API fica local',
    completeAnonymity: 'Anonimato completo',
    gdprCompliantByDesign: 'Compatível com GDPR por design',
    transparencyTrust: 'Transparência e Confiança',
    transparencyTrustDesc: 'Seu apoio vai diretamente para: Custos de hospedagem do servidor, uso da API OpenAI, tempo de desenvolvimento e manutenção da plataforma. Acreditamos em manter a educação acessível para todos, independentemente de sua situação financeira ou disposição para criar contas. O Studorama sempre permanecerá gratuito e sem necessidade de conta.',
    mostPopular: 'Mais Popular',
    advanced: 'Avançado',
    standard: 'Padrão',
    basic: 'Básico',
    advancedDesc: 'Apoie o desenvolvimento do Studorama com uma contribuição mensal generosa. Nos ajude a manter e melhorar a plataforma para todos.',
    standardDesc: 'Mostre seu apreço com uma contribuição mensal. Cada bit nos ajuda a manter o Studorama gratuito e acessível.',
    basicDesc: 'Nos compre um café todo mês! Um pequeno gesto que faz uma grande diferença no apoio à nossa missão.',
    
    // Theme Support
    theme: 'Tema',
    themes: 'Temas',
    appearance: 'Aparência',
    selectTheme: 'Selecionar Tema',
    themeSettings: 'Configurações de Tema',
    customizeAppearance: 'Personalize a aparência do Studorama',
    
    // Common
    loading: 'Carregando...',
    error: 'Erro',
    retry: 'Tentar Novamente',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    yes: 'Sim',
    no: 'Não',
    save: 'Salvar',
  }
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations['en-US'];
}

export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
  
  if (browserLang.startsWith('pt')) {
    return 'pt-BR';
  }
  
  return 'en-US';
}

export function formatDate(date: string, language: Language): string {
  const dateObj = new Date(date);
  
  if (language === 'pt-BR') {
    return dateObj.toLocaleDateString('pt-BR');
  }
  
  return dateObj.toLocaleDateString('en-US');
}