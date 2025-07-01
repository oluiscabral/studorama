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
  saveSettings: string;
  saved: string;
  configurationStatus: string;
  configured: string;
  notConfigured: string;
  selectedModel: string;
  enhancedStudyMode: string;
  ready: string;
  requiresApiKey: string;
  
  // Common
  loading: string;
  error: string;
  retry: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  yes: string;
  no: string;
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
    questionType: 'Question Type',
    multipleChoice: 'Multiple Choice',
    quickAssessment: 'Quick assessment questions',
    dissertative: 'Dissertative',
    deepAnalysis: 'Deep analysis questions',
    mixed: 'Mixed',
    interleavedPractice: 'Interleaved practice',
    learningTechniques: 'Learning Techniques (Based on "Make It Stick")',
    makeItStickBased: 'Based on "Make It Stick"',
    spacedRepetitionDesc: 'Review questions at increasing intervals',
    interleavingDesc: 'Mix different question types for better retention',
    elaborativeInterrogationDesc: 'Ask "why" questions for deeper understanding',
    retrievalPracticeDesc: 'Test yourself to strengthen memory',
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
    saveSettings: 'Save Settings',
    saved: 'Saved!',
    configurationStatus: 'Configuration Status',
    configured: 'Configured',
    notConfigured: 'Not Configured',
    selectedModel: 'Selected Model',
    enhancedStudyMode: 'Enhanced Study Mode',
    ready: 'Ready',
    requiresApiKey: 'Requires API Key',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
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
    questionType: 'Tipo de Questão',
    multipleChoice: 'Múltipla Escolha',
    quickAssessment: 'Questões de avaliação rápida',
    dissertative: 'Dissertativa',
    deepAnalysis: 'Questões de análise profunda',
    mixed: 'Misto',
    interleavedPractice: 'Prática intercalada',
    learningTechniques: 'Técnicas de Aprendizado (Baseado em "Make It Stick")',
    makeItStickBased: 'Baseado em "Make It Stick"',
    spacedRepetitionDesc: 'Revisar questões em intervalos crescentes',
    interleavingDesc: 'Misturar diferentes tipos de questões para melhor retenção',
    elaborativeInterrogationDesc: 'Fazer perguntas "por que" para compreensão mais profunda',
    retrievalPracticeDesc: 'Testar-se para fortalecer a memória',
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
    saveSettings: 'Salvar Configurações',
    saved: 'Salvo!',
    configurationStatus: 'Status da Configuração',
    configured: 'Configurado',
    notConfigured: 'Não Configurado',
    selectedModel: 'Modelo Selecionado',
    enhancedStudyMode: 'Modo de Estudo Aprimorado',
    ready: 'Pronto',
    requiresApiKey: 'Requer Chave da API',
    
    // Common
    loading: 'Carregando...',
    error: 'Erro',
    retry: 'Tentar Novamente',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    yes: 'Sim',
    no: 'Não',
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