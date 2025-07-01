export interface StudySession {
  id: string;
  subject: string;
  createdAt: string;
  questions: Question[];
  status: 'active' | 'completed';
  score: number;
  totalQuestions: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  attempts: number;
  feedback?: string;
}

export interface APISettings {
  openaiApiKey: string;
  model: string;
}