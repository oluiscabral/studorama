// custom-types.d.ts
import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
  interface HTMLAttributes<T> {
    inline?: boolean;
  }
}

export interface StudySession {
  id: string;
  contexts: string[]; // List of study contexts (minimum 1)
  instructions?: string[]; // Optional special instructions
  createdAt: string;
  questions: Question[];
  status: 'active' | 'completed';
  score: number;
  totalQuestions: number;
  questionType?: 'multipleChoice' | 'dissertative' | 'mixed';
  learningSettings?: LearningSettings;
  spacedRepetition?: SpacedRepetitionData;
  currentQuestionIndex?: number; // Track which question the user was on
  preloadedQuestions?: Question[]; // Questions loaded ahead of time
  enableLatex?: boolean; // LaTeX visualization option
  enableCodeVisualization?: boolean; // Code visualization option
  
  // Enhanced session state preservation
  sessionState?: SessionState;
  
  // Session history tracking
  contextsHistory?: ContextsHistoryEntry[];
  instructionHistory?: InstructionHistoryEntry[];
  learningSettingsHistory?: LearningSettingsHistoryEntry[];
}

export interface SessionState {
  currentUserAnswer?: string | number;
  currentConfidence?: number;
  showFeedback?: boolean;
  showElaborative?: boolean;
  showSelfExplanation?: boolean;
  elaborativeQuestion?: string;
  elaborativeAnswer?: string;
  selfExplanationAnswer?: string;
  isEvaluating?: boolean;
  lastSavedAt: string;
}

export interface ContextsHistoryEntry {
  id: string;
  previousContexts: string[];
  newContexts: string[];
  changedAt: string;
  reason?: string;
}

export interface InstructionHistoryEntry {
  id: string;
  action: 'added' | 'removed';
  instruction: string;
  previousValue?: string;
  changedAt: string;
}

export interface LearningSettingsHistoryEntry {
  id: string;
  previousSettings: LearningSettings;
  newSettings: LearningSettings;
  changedAt: string;
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: number;
  userAnswer?: number | string;
  isCorrect?: boolean;
  attempts: number;
  feedback?: string;
  type: 'multipleChoice' | 'dissertative';
  correctAnswerText?: string;
  aiEvaluation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  reviewCount?: number;
  lastReviewed?: string;
  nextReview?: string;
  confidence?: number; // 1-5 scale
  retrievalStrength?: number; // How well the user knows this
  isPreloaded?: boolean; // Mark if this question was preloaded
  
  // Question timing
  timeSpent?: number; // in ms
  startedAt?: string;
  completedAt?: string;
  timedOut?: boolean;
}

export interface LearningSettings {
  spacedRepetition: boolean;
  interleaving: boolean;
  elaborativeInterrogation: boolean;
  selfExplanation: boolean;
  desirableDifficulties: boolean;
  retrievalPractice: boolean;
  generationEffect: boolean;
}

export interface LearningTechniquesPreference {
  rememberChoice: boolean;
  defaultSettings: LearningSettings;
}

export interface SpacedRepetitionData {
  reviewIntervals: number[]; // Days between reviews
  currentInterval: number;
  easeFactor: number;
  reviewCount: number;
}

export interface APISettings {
  openaiApiKey: string;
  model: string;
  customPrompts: {
    multipleChoice: string;
    dissertative: string;
    evaluation: string;
    elaborativePrompt: string;
    retrievalPrompt: string;
  };
  preloadQuestions?: number; // Number of questions to preload
}

export interface PreloadingSettings {
  preloadQuestions: number;
  enableBackgroundLoading: boolean;
}

export type Language = 'en-US' | 'pt-BR';

export interface LanguageSettings {
  language: Language;
}

// Timer preferences stored globally with auto-save
export interface TimerPreferences {
  rememberChoice: boolean;
  defaultSessionTimerEnabled: boolean;
  defaultSessionTimer: number; // in minutes
  defaultQuestionTimerEnabled: boolean;
  defaultQuestionTimer: number; // in seconds
  defaultAccumulateTime: boolean;
  defaultShowWarnings: boolean;
  defaultAutoSubmit: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
