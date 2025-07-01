export interface StudySession {
  id: string;
  subject: string;
  createdAt: Date;
  completedAt?: Date;
  questions: Question[];
  score: number;
  totalQuestions: number;
  isCompleted: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  explanation?: string;
}

export interface AppState {
  currentView: 'home' | 'study' | 'history' | 'session-details';
  currentSession: StudySession | null;
  sessionHistory: StudySession[];
  selectedSessionId: string | null;
  apiKey: string;
}