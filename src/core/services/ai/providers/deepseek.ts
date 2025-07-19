/**
 * DeepSeek Provider Implementation
 */

import { AIRequest, AIResponse, AIError } from '../../../types/ai.types';

export class DeepSeekProvider {
  private baseUrl = 'https://api.deepseek.com/v1';

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    if (!request.apiKey) {
      throw this.createError('API key is required for DeepSeek', 'MISSING_API_KEY');
    }

    try {
      const response = await fetch(`${request.baseUrl || this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
          ...request.customHeaders,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 800,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          `DeepSeek API error: ${response.statusText}. ${errorData.error?.message || ''}`,
          errorData.error?.code || 'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw this.createError('Invalid response format from DeepSeek', 'INVALID_RESPONSE');
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        model: data.model,
        finishReason: data.choices[0].finish_reason,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AIError') {
        throw error;
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
    error.provider = 'deepseek';
    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    return error;
  }
}
