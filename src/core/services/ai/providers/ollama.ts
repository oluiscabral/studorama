/**
 * Ollama Provider Implementation
 */

import { AIRequest, AIResponse, AIError } from '../../../types/ai.types';

export class OllamaProvider {
  private baseUrl = 'http://localhost:11434/v1';

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${request.baseUrl || this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...request.customHeaders,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 800,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle common Ollama connection errors
        if (response.status === 0 || !response.status) {
          throw this.createError(
            'Cannot connect to Ollama. Make sure Ollama is running on your machine.',
            'CONNECTION_ERROR',
            undefined,
            true
          );
        }
        
        throw this.createError(
          `Ollama API error: ${response.statusText}. ${errorData.error?.message || ''}`,
          errorData.error?.code || 'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw this.createError('Invalid response format from Ollama', 'INVALID_RESPONSE');
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
        model: data.model || request.model,
        finishReason: data.choices[0].finish_reason,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AIError') {
        throw error;
      }
      
      // Handle network errors specifically for Ollama
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createError(
          'Cannot connect to Ollama. Make sure Ollama is running and accessible.',
          'CONNECTION_ERROR',
          undefined,
          true
        );
      }
      
      throw this.createError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        undefined,
        true
      );
    }
  }

  private createError(
    message: string, 
    code?: string, 
    statusCode?: number, 
    retryable = false
  ): AIError {
    const error = new Error(message) as AIError;
    error.name = 'AIError';
    error.provider = 'ollama';
    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    return error;
  }
}
