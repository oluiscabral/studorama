/**
 * Core AI types for multi-provider support
 */

export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'deepseek' | 'ollama' | 'browser';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
  capabilities: {
    multipleChoice: boolean;
    dissertative: boolean;
    evaluation: boolean;
    reasoning: boolean;
    codeGeneration: boolean;
  };
  recommended?: boolean;
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  setupInstructions: string[];
  models: AIModel[];
  defaultModel: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  maxTokens: {
    multipleChoice: number;
    dissertative: number;
    evaluation: number;
  };
  temperature: {
    multipleChoice: number;
    dissertative: number;
    evaluation: number;
  };
}

export interface AIProviderSettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
}

export interface AIRequest {
  provider: AIProvider;
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

export interface QuestionGenerationRequest {
  contexts: string[]; // Minimum 1 context required (replaces subject)
  type: 'multipleChoice' | 'dissertative' | 'evaluation';
  language: string;
  instructions?: string[];
  previousQuestions?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  customPrompt?: string;
}

export interface GeneratedQuestion {
  question: string;
  type: 'multipleChoice' | 'dissertative';
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  sampleAnswer?: string;
  evaluationCriteria?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  metadata?: {
    provider: AIProvider;
    model: string;
    tokensUsed?: number;
    generationTime?: number;
  };
}

export interface AnswerEvaluationRequest {
  question: string;
  userAnswer: string;
  correctAnswer?: string;
  type: 'multipleChoice' | 'dissertative';
  language: string;
  customPrompt?: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  suggestions?: string[];
  metadata?: {
    provider: AIProvider;
    model: string;
    tokensUsed?: number;
    evaluationTime?: number;
  };
}

export interface AIError extends Error {
  provider: AIProvider;
  code?: string;
  statusCode?: number;
  retryable?: boolean;
}
