/**
 * Centralized AI Service with multi-provider support
 */

import { Language } from '../../types';
import {
  AIError,
  AIProvider,
  AIProviderSettings,
  AIRequest,
  AIResponse,
  AnswerEvaluation,
  AnswerEvaluationRequest,
  GeneratedQuestion,
  QuestionGenerationRequest
} from '../../types/ai.types';
import {
  getPromptTemplate,
  replacePromptVariables
} from './prompts/promptRegistry';
import { AnthropicProvider } from './providers/anthropic';
import { BrowserAIProvider } from './providers/browser';
import { DeepSeekProvider } from './providers/deepseek';
import { GeminiProvider } from './providers/gemini';
import { OllamaProvider } from './providers/ollama';
import { OpenAIProvider } from './providers/openai';
import { getProviderConfig, validateProviderConfig } from './providers/registry';

/**
 * Main AI Service class
 */
export class AIService {
  private providers: Map<AIProvider, any> = new Map();

  constructor() {
    // Initialize all providers
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('browser', new BrowserAIProvider());
  }

  /**
   * Generate a question using the specified provider
   */
  async generateQuestion(
    request: QuestionGenerationRequest,
    settings: AIProviderSettings
  ): Promise<GeneratedQuestion> {
    const startTime = Date.now();
    
    try {
      // Validate that at least one context is provided
      if (!request.contexts || request.contexts.length === 0) {
        throw new Error('At least one study context is required');
      }

      // Validate provider settings
      const validation = validateProviderConfig(settings.provider, {
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: settings.baseUrl,
      });
      
      if (!validation.valid) {
        throw new Error(`Invalid provider configuration: ${validation.errors.join(', ')}`);
      }

      // Get provider configuration
      const providerConfig = getProviderConfig(settings.provider);
      
      // Determine prompt template based on question type
      let promptTemplateId: string;
      switch (request.type) {
        case 'multipleChoice':
          promptTemplateId = 'multipleChoice';
          break;
        case 'dissertative':
          promptTemplateId = 'dissertative';
          break;
        case 'evaluation':
          promptTemplateId = 'evaluation';
          break;
        default:
          promptTemplateId = 'multipleChoice';
      }

      // Get and prepare prompt
      const promptTemplate = getPromptTemplate(promptTemplateId, request.language as Language);      
      
      // Format contexts and instructions as numbered lists
      const contextsList = request.contexts.map((ctx, i) => `${i+1}. ${ctx}`).join('\n');
      const instructionsList = request.instructions?.length 
        ? request.instructions.map((instr, i) => `${i+1}. ${instr}`).join('\n')
        : 'No special instructions provided.';
      
      const previousQuestionsText = request.previousQuestions?.length
        ? request.previousQuestions.slice(-5).join(', ')
        : 'None';

      // Replace variables in the prompt template
      const prompt = replacePromptVariables(promptTemplate, {
        contextsList,
        instructionsList,
        difficulty: request.difficulty || 'medium',
        previousQuestions: previousQuestionsText,
      });

      // Prepare AI request
      const aiRequest: AIRequest = {
        provider: settings.provider,
        model: settings.model,
        messages: [
          { role: 'system', content: prompt },
          { 
            role: 'user', 
            content: request.customPrompt || this.getDefaultUserPrompt(request)
          }
        ],
        temperature: providerConfig.temperature[request.type] || 0.7,
        maxTokens: providerConfig.maxTokens[request.type] || 800,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        customHeaders: settings.customHeaders,
      };

      // Generate completion
      const response = await this.generateCompletion(aiRequest);
      
      // Parse response
      const parsedQuestion = this.parseQuestionResponse(response.content, request.type);
      
      // Add metadata
      const generatedQuestion: GeneratedQuestion = {
        ...parsedQuestion,
        metadata: {
          provider: settings.provider,
          model: settings.model,
          tokensUsed: response.usage?.totalTokens,
          generationTime: Date.now() - startTime,
        },
      };

      return generatedQuestion;
    } catch (error) {
      throw this.handleError(error, settings.provider);
    }
  }

  /**
   * Evaluate a student's answer
   */
  async evaluateAnswer(
    request: AnswerEvaluationRequest,
    settings: AIProviderSettings
  ): Promise<AnswerEvaluation> {
    const startTime = Date.now();
    
    try {
      // Validate provider settings
      const validation = validateProviderConfig(settings.provider, {
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: settings.baseUrl,
      });
      
      if (!validation.valid) {
        throw new Error(`Invalid provider configuration: ${validation.errors.join(', ')}`);
      }

      // Get provider configuration
      const providerConfig = getProviderConfig(settings.provider);
      
      // Get and prepare evaluation prompt
      const promptTemplate = getPromptTemplate('evaluation', request.language as Language);
      const correctAnswerText = request.correctAnswer 
        ? `Correct Answer: ${request.correctAnswer}`
        : '';

      const prompt = replacePromptVariables(promptTemplate, {
        question: request.question,
        userAnswer: request.userAnswer,
        correctAnswer: correctAnswerText,
        type: request.type,
      });

      // Prepare AI request
      const aiRequest: AIRequest = {
        provider: settings.provider,
        model: settings.model,
        messages: [
          { role: 'system', content: prompt }
        ],
        temperature: providerConfig.temperature.evaluation || 0.6,
        maxTokens: providerConfig.maxTokens.evaluation || 600,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        customHeaders: settings.customHeaders,
      };

      // Generate completion
      const response = await this.generateCompletion(aiRequest);
      
      // For now, we'll do a simple evaluation
      // In a more sophisticated implementation, this could parse structured feedback
      const evaluation: AnswerEvaluation = {
        isCorrect: this.determineCorrectness(request, response.content),
        score: this.calculateScore(request, response.content),
        feedback: response.content,
        metadata: {
          provider: settings.provider,
          model: settings.model,
          tokensUsed: response.usage?.totalTokens,
          evaluationTime: Date.now() - startTime,
        },
      };

      return evaluation;
    } catch (error) {
      throw this.handleError(error, settings.provider);
    }
  }

  /**
   * Generate elaborative question
   */
  async generateElaborativeQuestion(
    contexts: string[],
    originalQuestion: string,
    language: Language,
    settings: AIProviderSettings
  ): Promise<string> {
    try {
      if (!contexts || contexts.length === 0) {
        throw new Error('At least one study context is required');
      }

      const promptTemplate = getPromptTemplate('elaborative', language);
      const studyArea = contexts.join(', ');
      
      const prompt = replacePromptVariables(promptTemplate, {
        studyArea,
        question: originalQuestion,
      });

      const aiRequest: AIRequest = {
        provider: settings.provider,
        model: settings.model,
        messages: [
          { role: 'system', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 300,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        customHeaders: settings.customHeaders,
      };

      const response = await this.generateCompletion(aiRequest);
      return response.content;
    } catch (error) {
      throw this.handleError(error, settings.provider);
    }
  }

  /**
   * Generate completion using the appropriate provider
   */
  private async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const provider = this.providers.get(request.provider);
    if (!provider) {
      throw new Error(`Provider not found: ${request.provider}`);
    }

    return await provider.generateCompletion(request);
  }

  /**
   * Parse question response based on type
   */
  private parseQuestionResponse(
    content: string, 
    type: QuestionGenerationRequest['type']
  ): Omit<GeneratedQuestion, 'metadata'> {
    try {
      const parsed = parseJSON(content);
      
      if (type === 'multipleChoice' || parsed.type === 'multipleChoice') {
        return {
          question: parsed.question,
          type: 'multipleChoice',
          options: parsed.options,
          correctAnswer: parsed.correctAnswer,
          explanation: parsed.explanation,
          difficulty: parsed.difficulty,
        };
      } else {
        return {
          question: parsed.question,
          type: 'dissertative',
          sampleAnswer: parsed.sampleAnswer,
          evaluationCriteria: parsed.evaluationCriteria,
          difficulty: parsed.difficulty,
        };
      }
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default user prompt based on request
   */
  private getDefaultUserPrompt(request: QuestionGenerationRequest): string {
    const isPortuguese = request.language === 'pt-BR';
    const contextsString = request.contexts.join(', ');
    
    switch (request.type) {
      case 'multipleChoice':
        return isPortuguese
          ? `Crie uma questão de múltipla escolha baseada nos contextos de estudo: "${contextsString}". Torne-a desafiadora mas justa para o nível ${request.difficulty || 'médio'}. Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a multiple choice question based on the study contexts: "${contextsString}". Make it challenging but fair for ${request.difficulty || 'medium'} level. Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
      
      case 'dissertative':
        return isPortuguese
          ? `Crie uma questão dissertativa baseada nos contextos de estudo: "${contextsString}". Torne-a instigante e que exija análise detalhada para o nível ${request.difficulty || 'médio'}. Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a dissertative question based on the study contexts: "${contextsString}". Make it thought-provoking and require detailed analysis for ${request.difficulty || 'medium'} level. Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
      
      case 'evaluation':
        return isPortuguese
          ? `Crie uma questão de prática de recuperação baseada nos contextos de estudo: "${contextsString}". Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a evaluation practice question based on the study contexts: "${contextsString}". Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
      
      default:
        return isPortuguese
          ? `Crie uma questão baseada nos contextos de estudo: "${contextsString}". Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a question based on the study contexts: "${contextsString}". Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
    }
  }

  /**
   * Determine if answer is correct (simplified implementation)
   */
  private determineCorrectness(
    request: AnswerEvaluationRequest, 
    feedback: string
  ): boolean {
    // This is a simplified implementation
    // In practice, you might want more sophisticated analysis
    const lowerFeedback = feedback.toLowerCase();
    
    if (request.type === 'multipleChoice') {
      return lowerFeedback.includes('correct') && !lowerFeedback.includes('incorrect');
    }
    
    // For dissertative questions, look for positive indicators
    const positiveIndicators = ['good', 'excellent', 'correct', 'well', 'strong'];
    const negativeIndicators = ['incorrect', 'wrong', 'poor', 'weak', 'missing'];
    
    const positiveCount = positiveIndicators.filter(word => lowerFeedback.includes(word)).length;
    const negativeCount = negativeIndicators.filter(word => lowerFeedback.includes(word)).length;
    
    return positiveCount > negativeCount;
  }

  /**
   * Calculate score based on feedback (simplified implementation)
   */
  private calculateScore(
    request: AnswerEvaluationRequest, 
    feedback: string
  ): number {
    // This is a simplified implementation
    // In practice, you might want more sophisticated scoring
    
    if (request.type === 'multipleChoice') {
      return this.determineCorrectness(request, feedback) ? 100 : 0;
    }
    
    // For dissertative questions, estimate score based on feedback tone
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('excellent') || lowerFeedback.includes('outstanding')) {
      return 95;
    } else if (lowerFeedback.includes('good') || lowerFeedback.includes('well')) {
      return 80;
    } else if (lowerFeedback.includes('adequate') || lowerFeedback.includes('satisfactory')) {
      return 70;
    } else if (lowerFeedback.includes('needs improvement') || lowerFeedback.includes('weak')) {
      return 50;
    } else if (lowerFeedback.includes('poor') || lowerFeedback.includes('incorrect')) {
      return 30;
    }
    
    return 60; // Default score
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any, provider: AIProvider): AIError {
    if (error instanceof Error && error.name === 'AIError') {
      return error as AIError;
    }
    
    const aiError = new Error(error.message || 'Unknown AI service error') as AIError;
    aiError.name = 'AIError';
    aiError.provider = provider;
    aiError.retryable = true;
    
    return aiError;
  }
}

// Export singleton instance
export const aiService = new AIService();
