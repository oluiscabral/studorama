import JSON5 from 'json5';

/**
 * Robustly extract JSON or JSON5 content from arbitrary strings while preserving LaTeX.
 */
export function extractJSON(raw: string): string {
  let text = raw;

  // Remove BOM
  text = text.replace(/^\uFEFF/, '');

  // If there's a JSON code fence, extract that content first
  const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1];
  }
  // Otherwise, remove other fences and markers but keep content
  else {
    // Strip generic code fences (``` … ```)
    text = text.replace(/```[\s\S]*?```/g, match => {
      // preserve inner content if it looks like JSON
      const inner = match.replace(/```/g, '');
      if (/^[\s]*[{\[]/.test(inner)) {
        return inner;
      }
      return '';
    });
  }

  // Remove any leading/trailing non-json text before first brace
  const first = text.search(/[\[{]/);
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    text = text.substring(first, last + 1);
  }

  // Only remove specific control characters, preserve LaTeX backslashes and math symbols
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
             .replace(/`/g, '');

  // Remove trailing commas
  text = text.replace(/,\s*([}\]])/g, '$1');

  return text.trim();
}

/**
 * Enhanced JSON parser with better error recovery for truncated responses
 */
export function parseJSON(raw: string): any {
  const jsonString = extractJSON(raw);
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      return JSON5.parse(jsonString);
    } catch (e2) {
      // Try to fix common truncation issues
      try {
        let fixedJson = jsonString;
        
        // If the JSON ends with an incomplete string, try to close it
        if (fixedJson.match(/[^"\\]"[^"]*$/)) {
          fixedJson = fixedJson.replace(/([^"\\]"[^"]*)$/, '$1"');
        }
        
        // If there's an incomplete array, try to close it
        if (fixedJson.match(/\[[^\]]*$/)) {
          fixedJson = fixedJson + ']';
        }
        
        // If there's an incomplete object, try to close it
        const openBraces = (fixedJson.match(/\{/g) || []).length;
        const closeBraces = (fixedJson.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          fixedJson = fixedJson + '}'.repeat(missingBraces);
        }
        
        // Try parsing the fixed JSON
        return JSON.parse(fixedJson);
      } catch (e3) {
        try {
          return JSON5.parse(fixedJson);
        } catch (e4) {
          console.error('Failed to parse JSON string:', jsonString);
          console.error('Original error:', e.message);
          console.error('JSON5 error:', e2.message);
          console.error('Recovery attempt error:', e4.message);
          throw new Error(`Parsing error: Response appears to be truncated. Please try again with a shorter question or check your OpenAI API limits.`);
        }
      }
    }
  }
}

export async function generateQuestion(subject: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string, language: string = 'en-US'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro. SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.' 
    : 'Respond in English. ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates multiple choice questions about ${subject}. ${languageInstruction} 

CRITICAL REQUIREMENTS FOR ALL CONTENT (question, options, explanation):
1. ALL mathematical expressions MUST be properly wrapped in LaTeX notation
2. Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$
3. Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$
4. Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.
5. Add spaces around inline math expressions in text
6. Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)
7. EVERY option must also use proper LaTeX: "$x = 2$", "$\\frac{1}{2}$", "$\\sin(\\pi) = 0$"
8. Keep content concise to avoid truncation

Return ONLY a JSON object with: question (string with proper LaTeX), options (array of 4 strings with proper LaTeX), correctAnswer (number 0-3), and explanation (string with proper LaTeX). Do not include any other text or formatting.`;

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
            ? `Crie uma questão de múltipla escolha sobre ${subject}. Torne-a desafiadora mas justa. Use notação LaTeX CORRETA para TODAS as expressões matemáticas em TODAS as partes (questão, opções, explicação) com espaços adequados: "A função $f(x) = x^2$ é uma parábola", opções como "$x = 2$", "$\\frac{a}{b}$", "$\\lim_{x \\to 0}$", etc. Mantenha o conteúdo conciso.`
            : `Create a multiple choice question about ${subject}. Make it challenging but fair. Use CORRECT LaTeX notation for ALL mathematical expressions in ALL parts (question, options, explanation) with proper spacing: "The function $f(x) = x^2$ is a parabola", options like "$x = 2$", "$\\frac{a}{b}$", "$\\lim_{x \\to 0}$", etc. Keep content concise.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800, // Increased from 500
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return parseJSON(content);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    console.error('Extracted content:', extractJSON(content));
    console.error('Parse error:', e);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function generateDissertativeQuestion(subject: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string, language: string = 'en-US'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro. SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.' 
    : 'Respond in English. ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates dissertative questions about ${subject}. ${languageInstruction} 

CRITICAL REQUIREMENTS FOR ALL CONTENT (question, sampleAnswer, evaluationCriteria):
1. ALL mathematical expressions MUST be properly wrapped in LaTeX notation
2. Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$
3. Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$
4. Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.
5. Add spaces around inline math expressions in text
6. Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)
7. Keep content reasonably concise to avoid truncation
8. Limit evaluationCriteria to 3-4 short, clear points

Create an open-ended question that requires thoughtful analysis and explanation. Return ONLY a JSON object with: question (string with proper LaTeX), sampleAnswer (string with comprehensive model answer using proper LaTeX), and evaluationCriteria (array of 3-4 short strings). Do not include any other text or formatting.`;

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
            ? `Crie uma questão dissertativa sobre ${subject}. Torne-a instigante e que exija análise detalhada. Use notação LaTeX CORRETA para TODAS as expressões matemáticas em TODAS as partes com espaços adequados: "A função $f(x) = x^2$ é uma parábola", $\\frac{a}{b}$, $\\lim_{x \\to 0}$, etc. Mantenha o conteúdo razoavelmente conciso.`
            : `Create a dissertative question about ${subject}. Make it thought-provoking and require detailed analysis. Use CORRECT LaTeX notation for ALL mathematical expressions in ALL parts with proper spacing: "The function $f(x) = x^2$ is a parabola", $\\frac{a}{b}$, $\\lim_{x \\to 0}$, etc. Keep content reasonably concise.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1200, // Increased from 800
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return parseJSON(content);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    console.error('Extracted content:', extractJSON(content));
    console.error('Parse error:', e);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function evaluateAnswer(question: string, userAnswer: string, correctAnswer: string, apiKey: string, model: string = 'gpt-4o-mini', customPrompt?: string, language: string = 'en-US'): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro. SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.' 
    : 'Respond in English. ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';

  const prompt = customPrompt 
    ? customPrompt
        .replace('{question}', question)
        .replace('{userAnswer}', userAnswer)
        .replace('{modelAnswer}', correctAnswer)
    : `${languageInstruction} 

CRITICAL REQUIREMENTS for your feedback:
1. ALL mathematical expressions MUST be properly wrapped in LaTeX notation
2. Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$
3. Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$
4. Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.
5. Add spaces around inline math expressions in text
6. Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)
7. Keep feedback concise and focused

You are evaluating a student's answer to a dissertative question. 
Question: ${question}
Student's answer: ${userAnswer}
Model answer: ${correctAnswer}

Provide constructive feedback focusing on accuracy, completeness, and understanding. Rate the answer and suggest improvements. Be encouraging but honest. Use proper LaTeX notation with spacing for any mathematical expressions in your feedback.`;

  const systemMessage = language === 'pt-BR'
    ? 'Você é um assistente de estudos útil. Forneça feedback encorajador para respostas corretas e incorretas. Mantenha as respostas concisas e educativas. SEMPRE use notação LaTeX correta com espaçamento adequado para expressões matemáticas: "A função $f(x) = x^2$ é uma parábola", $\\frac{a}{b}$, $\\lim_{x \\to 0}$, etc.'
    : 'You are a helpful study assistant. Provide encouraging feedback for both correct and incorrect answers. Keep responses concise and educational. ALWAYS use correct LaTeX notation with proper spacing for mathematical expressions: "The function $f(x) = x^2$ is a parabola", $\\frac{a}{b}$, $\\lim_{x \\to 0}$, etc.';

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
      max_tokens: 600, // Increased from 400
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

  const languageInstruction = language === 'pt-BR' 
    ? 'SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.' 
    : 'ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos que ajuda estudantes a pensar mais profundamente sobre tópicos através de interrogação elaborativa. ${languageInstruction}`
    : `You are a study assistant that helps students think deeper about topics through elaborative interrogation. ${languageInstruction}`;

  const userMessage = language === 'pt-BR'
    ? `Para a matéria "${subject}" e questão "${question}", gere uma pergunta de acompanhamento "por que" que ajude o estudante a pensar mais profundamente sobre os conceitos subjacentes e conexões. Use notação LaTeX correta com espaçamento adequado para expressões matemáticas: "A função $f(x) = x^2$ é uma parábola", $\\frac{a}{b}$, $\\lim_{x \\to 0}$, etc.`
    : `For the subject "${subject}" and question "${question}", generate a follow-up "why" question that helps the student think more deeply about the underlying concepts and connections. Use correct LaTeX notation with proper spacing for mathematical expressions: "The function $f(x) = x^2$ is a parabola", $\\frac{a}{b}$, $\\lim_{x \\to 0}$, etc.`;

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
      max_tokens: 300, // Increased from 200
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
    ? 'Responda em português brasileiro. SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.' 
    : 'Respond in English. ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';

  const questionsContext = previousQuestions.length > 0 
    ? (language === 'pt-BR' 
        ? `Questões anteriores cobertas: ${previousQuestions.slice(-5).join(', ')}`
        : `Previous questions covered: ${previousQuestions.slice(-5).join(', ')}`)
    : '';

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos que cria questões de prática de recuperação sobre ${subject}. ${questionsContext}. ${languageInstruction} 

REQUISITOS CRÍTICOS PARA TODO CONTEÚDO (questão, opções, explicação, resposta modelo):
1. Todas as expressões matemáticas DEVEM estar envolvidas em notação LaTeX correta
2. Use $...$ para matemática inline: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$
3. Use $$...$$ para matemática em bloco: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$
4. Sempre escape barras invertidas adequadamente: \\frac, \\lim, \\sin, \\cos, etc.
5. Adicione espaços ao redor de expressões matemáticas inline no texto
6. Exemplo: "A função $f(x) = x^2$ é uma parábola" (note os espaços ao redor de $f(x) = x^2$)
7. TODA opção deve usar LaTeX adequado: "$x = 2$", "$\\frac{1}{2}$", "$\\sin(\\pi) = 0$"
8. Mantenha o conteúdo conciso para evitar truncamento

Crie uma questão que teste a recordação de material previamente coberto ou conecte novos conceitos aos antigos. Retorne APENAS um objeto JSON com: question (string com LaTeX correto), type (either "multiple-choice" or "dissertative"), e se múltipla escolha: options (array com LaTeX correto), correctAnswer (number), explanation (string com LaTeX correto). Se dissertativa: sampleAnswer (string com LaTeX correto). Não inclua nenhum outro texto ou formatação.`
    : `You are a study assistant that creates retrieval practice questions about ${subject}. ${questionsContext}. ${languageInstruction}

CRITICAL REQUIREMENTS FOR ALL CONTENT (question, options, explanation, sampleAnswer):
1. ALL mathematical expressions MUST be properly wrapped in LaTeX notation
2. Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$
3. Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$
4. Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.
5. Add spaces around inline math expressions in text
6. Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)
7. EVERY option must use proper LaTeX: "$x = 2$", "$\\frac{1}{2}$", "$\\sin(\\pi) = 0$"
8. Keep content concise to avoid truncation

Create a question that tests recall of previously covered material or connects new concepts to old ones. Return ONLY a JSON object with: question (string with proper LaTeX), type (either "multiple-choice" or "dissertative"), and if multiple-choice: options (array with proper LaTeX), correctAnswer (number), explanation (string with proper LaTeX). If dissertative: sampleAnswer (string with proper LaTeX). Do not include any other text or formatting.`;

  const userMessage = language === 'pt-BR'
    ? `Crie uma questão de prática de recuperação sobre ${subject} que ajude a reforçar o aprendizado anterior. Use notação LaTeX CORRETA para TODAS as expressões matemáticas em TODAS as partes com espaçamento adequado: "A função $f(x) = x^2$ é uma parábola", opções como "$x = 2$", "$\\frac{a}{b}$", "$\\lim_{x \\to 0}$", etc. Mantenha o conteúdo conciso.`
    : `Create a retrieval practice question about ${subject} that helps reinforce previous learning. Use CORRECT LaTeX notation for ALL mathematical expressions in ALL parts with proper spacing: "The function $f(x) = x^2$ is a parabola", options like "$x = 2$", "$\\frac{a}{b}$", "$\\lim_{x \\to 0}$", etc. Keep content concise.`;

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
      max_tokens: 800, // Increased from 600
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText}. ${errorData.error?.message || ''}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return parseJSON(content);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    console.error('Extracted content:', extractJSON(content));
    console.error('Parse error:', e);
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
      max_tokens: 400, // Increased from 300
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