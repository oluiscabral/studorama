function extractJSON(content: string): string {
  // Remove markdown code blocks if present
  let cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Find the first and last curly braces to extract just the JSON
  const firstBrace = cleanContent.indexOf('{');
  const lastBrace = cleanContent.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
  }
  
  return cleanContent.trim();
}

export async function generateQuestion(subject: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string, language: string = 'en-US'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates multiple choice questions about ${subject}. ${languageInstruction} Return ONLY a JSON object with: question (string), options (array of 4 strings), correctAnswer (number 0-3), and explanation (string explaining why the correct answer is right). Do not include any other text or formatting.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: language === 'pt-BR' 
            ? `Crie uma questão de múltipla escolha sobre ${subject}. Torne-a desafiadora mas justa.`
            : `Create a multiple choice question about ${subject}. Make it challenging but fair.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const cleanContent = extractJSON(content);
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function generateDissertativeQuestion(subject: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string, language: string = 'en-US'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates dissertative questions about ${subject}. ${languageInstruction} Create an open-ended question that requires thoughtful analysis and explanation. Return ONLY a JSON object with: question (string), sampleAnswer (string with a comprehensive model answer), and evaluationCriteria (array of strings describing what makes a good answer). Do not include any other text or formatting.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: language === 'pt-BR'
            ? `Crie uma questão dissertativa sobre ${subject}. Torne-a instigante e que exija análise detalhada.`
            : `Create a dissertative question about ${subject}. Make it thought-provoking and require detailed analysis.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const cleanContent = extractJSON(content);
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function evaluateAnswer(question: string, userAnswer: string, correctAnswer: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string, language: string = 'en-US'): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  const prompt = customPrompt 
    ? customPrompt
        .replace('{question}', question)
        .replace('{userAnswer}', userAnswer)
        .replace('{modelAnswer}', correctAnswer)
    : `${languageInstruction} You are evaluating a student's answer to a dissertative question. Question: ${question}. Student's answer: ${userAnswer}. Model answer: ${correctAnswer}. Provide constructive feedback focusing on accuracy, completeness, and understanding. Rate the answer and suggest improvements. Be encouraging but honest.`;

  const systemMessage = language === 'pt-BR'
    ? 'Você é um assistente de estudos útil. Forneça feedback encorajador para respostas corretas e incorretas. Mantenha as respostas concisas e educativas.'
    : 'You are a helpful study assistant. Provide encouraging feedback for both correct and incorrect answers. Keep responses concise and educational.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateElaborativeQuestion(subject: string, question: string, apiKey: string, model: string = 'gpt-4o-mini', language: string = 'en-US'): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const systemMessage = language === 'pt-BR'
    ? 'Você é um assistente de estudos que ajuda estudantes a pensar mais profundamente sobre tópicos através de interrogação elaborativa.'
    : 'You are a study assistant that helps students think deeper about topics through elaborative interrogation.';

  const userMessage = language === 'pt-BR'
    ? `Para a matéria "${subject}" e questão "${question}", gere uma pergunta de acompanhamento "por que" que ajude o estudante a pensar mais profundamente sobre os conceitos subjacentes e conexões.`
    : `For the subject "${subject}" and question "${question}", generate a follow-up "why" question that helps the student think more deeply about the underlying concepts and connections.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateRetrievalQuestion(subject: string, previousQuestions: string[], apiKey: string, model: string = 'gpt-4o-mini', language: string = 'en-US'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  const questionsContext = previousQuestions.length > 0 
    ? (language === 'pt-BR' 
        ? `Questões anteriores cobertas: ${previousQuestions.slice(-5).join(', ')}`
        : `Previous questions covered: ${previousQuestions.slice(-5).join(', ')}`)
    : '';

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos que cria questões de prática de recuperação sobre ${subject}. ${questionsContext}. ${languageInstruction} Crie uma questão que teste a recordação de material previamente coberto ou conecte novos conceitos aos antigos. Retorne APENAS um objeto JSON com: question (string), type (either "multiple-choice" or "dissertative"), e se múltipla escolha: options (array), correctAnswer (number), explanation (string). Se dissertativa: sampleAnswer (string). Não inclua nenhum outro texto ou formatação.`
    : `You are a study assistant that creates retrieval practice questions about ${subject}. ${questionsContext}. Create a question that tests recall of previously covered material or connects new concepts to old ones. Return ONLY a JSON object with: question (string), type (either "multiple-choice" or "dissertative"), and if multiple-choice: options (array), correctAnswer (number), explanation (string). If dissertative: sampleAnswer (string). Do not include any other text or formatting.`;

  const userMessage = language === 'pt-BR'
    ? `Crie uma questão de prática de recuperação sobre ${subject} que ajude a reforçar o aprendizado anterior.`
    : `Create a retrieval practice question about ${subject} that helps reinforce previous learning.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const cleanContent = extractJSON(content);
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function generateModifierSuggestions(subject: string, apiKey: string, model: string = 'gpt-4o-mini', language: string = 'en-US'): Promise<string[]> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos que sugere contextos específicos para matérias de estudo. ${languageInstruction} Para a matéria fornecida, sugira contextos específicos como livros, capítulos, cursos, ou tópicos específicos que ajudariam a focar o estudo. Retorne APENAS um array JSON de strings com 3-5 sugestões específicas e úteis.`
    : `You are a study assistant that suggests specific contexts for study subjects. For the given subject, suggest specific contexts like books, chapters, courses, or specific topics that would help focus the study. Return ONLY a JSON array of strings with 3-5 specific and useful suggestions.`;

  const userMessage = language === 'pt-BR'
    ? `Sugira contextos específicos para estudar: ${subject}`
    : `Suggest specific contexts for studying: ${subject}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Try to extract JSON array from the response
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    
    // Fallback: try to parse the entire content
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse modifier suggestions:', content);
    // Return a fallback suggestion based on the subject
    return [language === 'pt-BR' ? `Fundamentos de ${subject}` : `Fundamentals of ${subject}`];
  }
}