/**
 * Centralized AI Service with multi-provider support
 */

import { parseJSON } from '../../../utils/openai';
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

      // Prepare AI request with enhanced user prompt for code questions
      const userPrompt = request.customPrompt || this.getEnhancedUserPrompt(request);

      console.log('=== DEBUG: AI Generation ===');
      console.log('System Prompt Length:', prompt.length);
      console.log('User Prompt:', userPrompt);
      console.log('Contexts:', request.contexts);
      console.log('Is Code Context:', this.isCodeContext(request.contexts));

      const aiRequest: AIRequest = {
        provider: settings.provider,
        model: settings.model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: providerConfig.temperature[request.type] || 0.7,
        maxTokens: providerConfig.maxTokens[request.type] || 800,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        customHeaders: settings.customHeaders,
      };

      // Generate completion
      const response = await this.generateCompletion(aiRequest);
      
      console.log('=== DEBUG: AI Response ===');
      console.log('Raw Response:', response.content);
      console.log('Response Length:', response.content.length);
      
      // Parse response
      const parsedQuestion = this.parseQuestionResponse(response.content, request.type);
      
      console.log('=== DEBUG: Parsed Question ===');
      console.log('Question Text:', parsedQuestion.question);
      console.log('Question Length:', parsedQuestion.question.length);
      console.log('Contains Code Block:', parsedQuestion.question.includes('```'));
      
      // Validate that code questions actually contain code
      this.validateCodeContent(parsedQuestion, request.contexts);
      
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

      console.log('=== DEBUG: Final Question ===');
      console.log('Final Question:', JSON.stringify(generatedQuestion, null, 2));

      return generatedQuestion;
    } catch (error) {
      console.error('=== DEBUG: Generation Error ===', error);
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
      const contextsList = contexts.map((ctx, i) => `${i+1}. ${ctx}`).join('\n');
      
      const prompt = replacePromptVariables(promptTemplate, {
        contextsList,
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
      console.log('=== DEBUG: Parsing Response ===');
      console.log('Raw content to parse:', content);
      
      // Extract JSON with improved regex that handles nested code blocks
      let jsonString = this.extractJsonFromResponse(content);
      console.log('Extracted JSON string:', jsonString);
      
      // Skip newline fixing since extraction now works correctly
      console.log('Skipping newline fixing - using extracted JSON directly');
      
      const parsed = JSON.parse(jsonString);
      console.log('Parsed JSON:', parsed);
      
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
      console.error('=== DEBUG: Parse Error ===');
      console.error('Error:', error);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract JSON from AI response with improved handling of nested code blocks
   */
  private extractJsonFromResponse(content: string): string {
    console.log('=== DEBUG: JSON Extraction ===');
    console.log('Content length:', content.length);
    console.log('Content:', content);
    
    // Find the start and end of the JSON code block
    const jsonStart = content.indexOf('```json');
    if (jsonStart === -1) {
      console.log('No ```json block found, trying fallback extraction');
      return this.fallbackJsonExtraction(content);
    }
    
    // Find the end of the opening ```json line
    const jsonContentStart = content.indexOf('\n', jsonStart) + 1;
    if (jsonContentStart === 0) {
      throw new Error('Malformed JSON code block - no newline after ```json');
    }
    
    // Find the closing ``` that ends the JSON block
    // We need to be careful not to match ``` inside the JSON content
    let searchPos = jsonContentStart;
    let jsonEnd = -1;
    
    while (searchPos < content.length) {
      const nextTripleBacktick = content.indexOf('```', searchPos);
      if (nextTripleBacktick === -1) {
        break;
      }
      
      // Check if this ``` is at the start of a line (or after whitespace)
      const lineStart = content.lastIndexOf('\n', nextTripleBacktick);
      const beforeTripleBacktick = content.substring(lineStart + 1, nextTripleBacktick);
      
      if (beforeTripleBacktick.trim() === '') {
        // This ``` is at the start of a line, likely the closing one
        jsonEnd = nextTripleBacktick;
        break;
      }
      
      // This ``` is inside content, keep searching
      searchPos = nextTripleBacktick + 3;
    }
    
    if (jsonEnd === -1) {
      throw new Error('No closing ``` found for JSON code block');
    }
    
    const extractedJson = content.substring(jsonContentStart, jsonEnd);
    
    console.log('Found JSON in code block');
    console.log('JSON start position:', jsonContentStart);
    console.log('JSON end position:', jsonEnd);
    console.log('Extracted length:', extractedJson.length);
    console.log('Extracted JSON preview:', extractedJson.substring(0, 200) + '...');
    
    return extractedJson;
  }

  /**
   * Fallback JSON extraction using brace matching
   */
  private fallbackJsonExtraction(content: string): string {
    console.log('=== DEBUG: Fallback JSON Extraction ===');
    
    // Look for any JSON object (starting with { and ending with })
    const startIndex = content.indexOf('{');
    if (startIndex === -1) {
      throw new Error('No JSON object found in response');
    }
    
    console.log('JSON starts at index:', startIndex);
    
    // Find the matching closing brace
    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }
    
    if (endIndex === -1) {
      throw new Error('No matching closing brace found for JSON object');
    }
    
    const extractedJson = content.substring(startIndex, endIndex + 1);
    console.log('Fallback extracted JSON length:', extractedJson.length);
    console.log('Fallback extracted JSON preview:', extractedJson.substring(0, 100) + '...');
    
    return extractedJson;
  }

  /**
   * Check if contexts suggest code-related content
   */
  private isCodeContext(contexts: string[]): boolean {
    const contextsString = contexts.join(' ').toLowerCase();
    const codeKeywords = [
      'python', 'javascript', 'java', 'c++', 'c#', 'html', 'css', 'sql', 
      'php', 'ruby', 'go', 'rust', 'swift', 'programação', 'programming',
      'código', 'code', 'algoritmo', 'algorithm', 'função', 'function'
    ];
    
    return codeKeywords.some(keyword => contextsString.includes(keyword));
  }

  /**
   * Validate that code questions actually contain code
   */
  private validateCodeContent(question: Omit<GeneratedQuestion, 'metadata'>, contexts: string[]): void {
    const questionText = question.question.toLowerCase();
    const contextText = contexts.join(' ').toLowerCase();
    
    console.log('=== DEBUG: Code Validation ===');
    console.log('Question text:', questionText);
    console.log('Context text:', contextText);
    
    // Check if this appears to be a code-related question
    const codeKeywords = [
      'código', 'code', 'programa', 'program', 'função', 'function', 
      'algoritmo', 'algorithm', 'script', 'saída', 'output', 'resultado',
      'execução', 'execution', 'python', 'javascript', 'java', 'c++', 'c#',
      'html', 'css', 'sql', 'php', 'ruby', 'go', 'rust', 'swift'
    ];
    
    const isCodeRelated = codeKeywords.some(keyword => 
      questionText.includes(keyword) || contextText.includes(keyword)
    );
    
    console.log('Is code related:', isCodeRelated);
    
    if (isCodeRelated) {
      // Check if the question contains code blocks
      const hasCodeBlock = question.question.includes('```') || question.question.includes('`');
      console.log('Has code block:', hasCodeBlock);
      
      // Check for phrases that indicate missing code
      const missingCodePhrases = [
        'seguinte código', 'following code', 'código acima', 'code above',
        'código abaixo', 'code below', 'este código', 'this code'
      ];
      
      const hasMissingCodePhrase = missingCodePhrases.some(phrase => 
        questionText.includes(phrase)
      );
      
      console.log('Has missing code phrase:', hasMissingCodePhrase);
      console.log('Missing code phrases found:', missingCodePhrases.filter(phrase => questionText.includes(phrase)));
      
      if (hasMissingCodePhrase && !hasCodeBlock) {
        console.error('=== VALIDATION FAILED ===');
        console.error('Code question generated without actual code content');
        console.error('Question:', question.question);
        throw new Error('Code question generated without actual code content. Please regenerate.');
      }
    }
  }

  /**
   * Get enhanced user prompt with code requirements
   */
  private getEnhancedUserPrompt(request: QuestionGenerationRequest): string {
    const isPortuguese = request.language === 'pt-BR';
    const contextsString = request.contexts.join(', ');
    
    // Check if contexts suggest programming/code content
    const isCodeContext = this.isCodeContext(request.contexts);
    
    console.log('=== DEBUG: User Prompt Generation ===');
    console.log('Is code context:', isCodeContext);
    console.log('Contexts:', contextsString);
    
    let basePrompt = '';
    
    switch (request.type) {
      case 'multipleChoice':
        basePrompt = isPortuguese
          ? `Crie uma questão de múltipla escolha baseada nos contextos de estudo: "${contextsString}". Torne-a desafiadora mas justa para o nível ${request.difficulty || 'médio'}. Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a multiple choice question based on the study contexts: "${contextsString}". Make it challenging but fair for ${request.difficulty || 'medium'} level. Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
        break;
      
      case 'dissertative':
        basePrompt = isPortuguese
          ? `Crie uma questão dissertativa baseada nos contextos de estudo: "${contextsString}". Torne-a instigante e que exija análise detalhada para o nível ${request.difficulty || 'médio'}. Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a dissertative question based on the study contexts: "${contextsString}". Make it thought-provoking and require detailed analysis for ${request.difficulty || 'medium'} level. Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
        break;
      
      case 'evaluation':
        basePrompt = isPortuguese
          ? `Crie uma questão de prática de recuperação baseada nos contextos de estudo: "${contextsString}". Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a evaluation practice question based on the study contexts: "${contextsString}". Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
        break;
      
      default:
        basePrompt = isPortuguese
          ? `Crie uma questão baseada nos contextos de estudo: "${contextsString}". Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo.`
          : `Create a question based on the study contexts: "${contextsString}". Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts.`;
    }
    
    // Add code-specific requirements if this appears to be a programming context
    if (isCodeContext) {
      const codeRequirement = isPortuguese
        ? `\n\nIMPORTANTE: Se sua questão mencionar código, algoritmos ou programação, você DEVE incluir o código real completo na questão usando blocos de código markdown (${"```"}linguagem). Nunca pergunte sobre "o seguinte código" sem mostrar o código real. EXEMPLO OBRIGATÓRIO: Se você perguntar "Qual será a saída do seguinte código Python?", você DEVE incluir o código real como: \`\`\`python\nfor i in range(3):\n    print(i * 2)\n\`\`\``
        : `\n\nIMPORTANT: If your question mentions code, algorithms, or programming, you MUST include the complete actual code in the question using markdown code blocks (${"```"}language). Never ask about "the following code" without showing the actual code. MANDATORY EXAMPLE: If you ask "What will be the output of the following Python code?", you MUST include the actual code like: \`\`\`python\nfor i in range(3):\n    print(i * 2)\n\`\`\``;
      
      basePrompt += codeRequirement;
    }
    
    console.log('Generated user prompt:', basePrompt);
    return basePrompt;
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
