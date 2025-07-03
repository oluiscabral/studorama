import { TimerSettings, SessionTimer, QuestionTimer } from './timer.types';

export interface StudySession {
  id: string;
  subject: string;
  subjectModifiers?: string[];
  createdAt: string;
  questions: Question[];
  status: 'active' | 'completed';
  score: number;
  totalQuestions: number;
  questionType?: 'multiple-choice' | 'dissertative' | 'mixed';
  learningSettings?: LearningSettings;
  spacedRepetition?: SpacedRepetitionData;
  currentQuestionIndex?: number; // Track which question the user was on
  preloadedQuestions?: Question[]; // Questions loaded ahead of time
  enableLatex?: boolean; // LaTeX visualization option
  enableCodeVisualization?: boolean; // Code visualization option
  
  // Enhanced session state preservation
  sessionState?: SessionState;
  
  // Session history tracking
  subjectHistory?: SubjectHistoryEntry[];
  modifierHistory?: ModifierHistoryEntry[];
  learningSettingsHistory?: LearningSettingsHistoryEntry[];
  
  // Timer settings
  timerSettings?: TimerSettings;
  sessionTimer?: SessionTimer;
  questionTimers?: QuestionTimer[];
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

export interface SubjectHistoryEntry {
  id: string;
  previousSubject: string;
  newSubject: string;
  changedAt: string;
  reason?: string;
}

export interface ModifierHistoryEntry {
  id: string;
  action: 'added' | 'removed' | 'modified';
  modifier: string;
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
  type: 'multiple-choice' | 'dissertative';
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