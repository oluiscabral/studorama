/**
 * Anthropic Claude Provider Implementation
 */

import { AIRequest, AIResponse, AIError } from '../../../types/ai.types';

export class AnthropicProvider {
  private baseUrl = 'https://api.anthropic.com/v1';

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    if (!request.apiKey) {
      throw this.createError('API key is required for Anthropic', 'MISSING_API_KEY');
    }

    try {
      // Convert messages to Anthropic format
      const { system, messages } = this.convertMessagesToAnthropicFormat(request.messages);
      
      const response = await fetch(`${request.baseUrl || this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': request.apiKey,
          'anthropic-version': '2023-06-01',
          ...request.customHeaders,
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens || 800,
          temperature: request.temperature || 0.7,
          system,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          `Anthropic API error: ${response.statusText}. ${errorData.error?.message || ''}`,
          errorData.error?.type || 'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw this.createError('Invalid response format from Anthropic', 'INVALID_RESPONSE');
      }

      return {
        content: data.content[0].text,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
        model: data.model,
        finishReason: data.stop_reason,
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

  private convertMessagesToAnthropicFormat(messages: AIRequest['messages']) {
    let system = '';
    const anthropicMessages = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        system += message.content + '\n';
      } else {
        anthropicMessages.push({
          role: message.role,
          content: message.content,
        });
      }
    }
    
    return { system: system.trim(), messages: anthropicMessages };
  }

  private createError(
    message: string, 
    code?: string, 
    statusCode?: number, 
    retryable = false
  ): AIError {
    const error = new Error(message) as AIError;
    error.name = 'AIError';
    error.provider = 'anthropic';
    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    return error;
  }
}
