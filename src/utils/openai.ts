export async function generateQuestion(subject: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates multiple choice questions about ${subject}. Return a JSON object with: question (string), options (array of 4 strings), correctAnswer (number 0-3), and explanation (string explaining why the correct answer is right).`;

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
          content: `Create a multiple choice question about ${subject}. Make it challenging but fair.`
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
    return JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function generateDissertativeQuestion(subject: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates dissertative questions about ${subject}. Create an open-ended question that requires thoughtful analysis and explanation. Return a JSON object with: question (string), sampleAnswer (string with a comprehensive model answer), and evaluationCriteria (array of strings describing what makes a good answer).`;

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
          content: `Create a dissertative question about ${subject}. Make it thought-provoking and require detailed analysis.`
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
    return JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function evaluateAnswer(question: string, userAnswer: string, correctAnswer: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const prompt = customPrompt 
    ? customPrompt
        .replace('{question}', question)
        .replace('{userAnswer}', userAnswer)
        .replace('{modelAnswer}', correctAnswer)
    : `You are evaluating a student's answer to a dissertative question. Question: ${question}. Student's answer: ${userAnswer}. Model answer: ${correctAnswer}. Provide constructive feedback focusing on accuracy, completeness, and understanding. Rate the answer and suggest improvements. Be encouraging but honest.`;

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
          content: 'You are a helpful study assistant. Provide encouraging feedback for both correct and incorrect answers. Keep responses concise and educational.'
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

export async function generateElaborativeQuestion(subject: string, question: string, apiKey: string, model: string = 'gpt-4o-mini'): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

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
          content: 'You are a study assistant that helps students think deeper about topics through elaborative interrogation.'
        },
        {
          role: 'user',
          content: `For the subject "${subject}" and question "${question}", generate a follow-up "why" question that helps the student think more deeply about the underlying concepts and connections.`
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

export async function generateRetrievalQuestion(subject: string, previousQuestions: string[], apiKey: string, model: string = 'gpt-4o-mini'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const questionsContext = previousQuestions.length > 0 
    ? `Previous questions covered: ${previousQuestions.slice(-5).join(', ')}`
    : '';

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
          content: `You are a study assistant that creates retrieval practice questions about ${subject}. ${questionsContext}. Create a question that tests recall of previously covered material or connects new concepts to old ones. Return a JSON object with: question (string), type (either "multiple-choice" or "dissertative"), and if multiple-choice: options (array), correctAnswer (number), explanation (string). If dissertative: sampleAnswer (string).`
        },
        {
          role: 'user',
          content: `Create a retrieval practice question about ${subject} that helps reinforce previous learning.`
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
    return JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}