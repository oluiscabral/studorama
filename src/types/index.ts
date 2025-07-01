export interface StudySession {
  id: string;
  subject: string;
  createdAt: string;
  questions: Question[];
  status: 'active' | 'completed';
  score: number;
  totalQuestions: number;
  questionType?: 'multiple-choice' | 'dissertative' | 'mixed';
  learningSettings?: LearningSettings;
  spacedRepetition?: SpacedRepetitionData;
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
}