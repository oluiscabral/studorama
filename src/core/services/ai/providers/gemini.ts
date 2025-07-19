/**
 * Google Gemini Provider Implementation
 */

import { AIRequest, AIResponse, AIError } from '../../../types/ai.types';

export class GeminiProvider {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    if (!request.apiKey) {
      throw this.createError('API key is required for Gemini', 'MISSING_API_KEY');
    }

    try {
      // Convert messages to Gemini format
      const contents = this.convertMessagesToGeminiFormat(request.messages);
      
      const response = await fetch(
        `${request.baseUrl || this.baseUrl}/models/${request.model}:generateContent?key=${request.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...request.customHeaders,
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 800,
              topP: 0.8,
              topK: 40,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          `Gemini API error: ${response.statusText}. ${errorData.error?.message || ''}`,
          errorData.error?.code || 'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw this.createError('Invalid response format from Gemini', 'INVALID_RESPONSE');
      }

      const candidate = data.candidates[0];
      const content = candidate.content.parts[0]?.text || '';

      return {
        content,
        usage: data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
        } : undefined,
        model: request.model,
        finishReason: candidate.finishReason,
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

  private convertMessagesToGeminiFormat(messages: AIRequest['messages']) {
    const contents = [];
    let systemInstruction = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        systemInstruction += message.content + '\n';
      } else {
        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        });
      }
    }
    
    // If we have system instructions, prepend them to the first user message
    if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = systemInstruction + '\n' + contents[0].parts[0].text;
    }
    
    return contents;
  }

  private createError(
    message: string, 
    code?: string, 
    statusCode?: number, 
    retryable = false
  ): AIError {
    const error = new Error(message) as AIError;
    error.name = 'AIError';
    error.provider = 'gemini';
    error.code = code;
    error.statusCode = statusCode;
    error.retryable = retryable;
    return error;
  }
}
