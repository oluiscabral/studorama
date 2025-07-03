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

export async function generateQuestion(
  subject: string, 
  apiKey: string, 
  model: string = 'gpt-4o-mini', 
  customPrompt?: string, 
  language: string = 'en-US',
  enableLatex: boolean = false,
  enableCodeVisualization: boolean = false
): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  // Build formatting instructions based on enabled features
  let formattingInstructions = '';
  
  if (enableLatex) {
    formattingInstructions += language === 'pt-BR'
      ? ' SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.'
      : ' ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';
  }

  if (enableCodeVisualization) {
    formattingInstructions += language === 'pt-BR'
      ? ' Inclua exemplos de código quando relevante usando blocos de código com ```linguagem``` para sintaxe destacada.'
      : ' Include code examples when relevant using code blocks with ```language``` for syntax highlighting.';
  }

  const contentRequirements = enableLatex || enableCodeVisualization
    ? `CRITICAL REQUIREMENTS FOR ALL CONTENT (question, options, explanation):
1. ${enableLatex ? 'ALL mathematical expressions MUST be properly wrapped in LaTeX notation' : 'Use clear mathematical notation without special formatting'}
2. ${enableLatex ? 'Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$' : 'Write mathematical expressions in plain text'}
3. ${enableLatex ? 'Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$' : 'Use clear formatting for complex expressions'}
4. ${enableLatex ? 'Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.' : 'Use standard mathematical notation'}
5. ${enableLatex ? 'Add spaces around inline math expressions in text' : 'Ensure clear readability'}
6. ${enableLatex ? 'Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)' : 'Use descriptive language for mathematical concepts'}
7. ${enableLatex ? 'EVERY option must also use proper LaTeX: "$x = 2$", "$\\frac{1}{2}$", "$\\sin(\\pi) = 0$"' : 'Keep options clear and concise'}
8. ${enableCodeVisualization ? 'Include relevant code examples using proper syntax highlighting' : 'Focus on conceptual understanding'}
9. Keep content concise to avoid truncation`
    : 'Keep content clear, concise, and focused on understanding the core concepts. Avoid complex formatting.';

  // Enhanced subject constraint
  const subjectConstraint = language === 'pt-BR'
    ? `RESTRIÇÃO CRÍTICA DE MATÉRIA: Você DEVE criar questões EXCLUSIVAMENTE sobre "${subject}". NÃO crie questões sobre outras matérias como Biologia, Química, Física, História, etc. A questão DEVE estar diretamente relacionada ao tópico específico: "${subject}".`
    : `CRITICAL SUBJECT CONSTRAINT: You MUST create questions EXCLUSIVELY about "${subject}". DO NOT create questions about other subjects like Biology, Chemistry, Physics, History, etc. The question MUST be directly related to the specific topic: "${subject}".`;

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates multiple choice questions about ${subject}. ${languageInstruction}${formattingInstructions} 

${subjectConstraint}

${contentRequirements}

Create questions that help students fully understand and master the subject "${subject}". Focus ONLY on:
- Core concepts and principles of ${subject}
- Practical applications within ${subject}
- Problem-solving approaches specific to ${subject}
- Critical thinking skills related to ${subject}
- Real-world connections within the scope of ${subject}

IMPORTANT: The question must be directly about "${subject}" and cannot deviate to other academic subjects or fields.

Return ONLY a JSON object with: question (string), options (array of 4 strings), correctAnswer (number 0-3), and explanation (string). Do not include any other text or formatting.`;

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
            ? `Crie uma questão de múltipla escolha EXCLUSIVAMENTE sobre "${subject}". A questão DEVE ser especificamente sobre ${subject} e NÃO sobre outras matérias. Torne-a desafiadora mas justa, focando na compreensão profunda dos conceitos fundamentais de ${subject}. ${enableLatex ? 'Use notação LaTeX correta com espaçamento adequado para expressões matemáticas.' : 'Use linguagem clara e descritiva.'} ${enableCodeVisualization ? 'Inclua exemplos de código quando apropriado.' : ''} Mantenha o conteúdo conciso e ESTRITAMENTE dentro do escopo de ${subject}.`
            : `Create a multiple choice question EXCLUSIVELY about "${subject}". The question MUST be specifically about ${subject} and NOT about other subjects. Make it challenging but fair, focusing on deep understanding of fundamental concepts of ${subject}. ${enableLatex ? 'Use correct LaTeX notation with proper spacing for mathematical expressions.' : 'Use clear and descriptive language.'} ${enableCodeVisualization ? 'Include code examples when appropriate.' : ''} Keep content concise and STRICTLY within the scope of ${subject}.`
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
    return parseJSON(content);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    console.error('Extracted content:', extractJSON(content));
    console.error('Parse error:', e);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

export async function generateDissertativeQuestion(
  subject: string, 
  apiKey: string, 
  model: string = 'gpt-4o-mini', 
  customPrompt?: string, 
  language: string = 'en-US',
  enableLatex: boolean = false,
  enableCodeVisualization: boolean = false
): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  // Build formatting instructions based on enabled features
  let formattingInstructions = '';
  
  if (enableLatex) {
    formattingInstructions += language === 'pt-BR'
      ? ' SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.'
      : ' ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';
  }

  if (enableCodeVisualization) {
    formattingInstructions += language === 'pt-BR'
      ? ' Inclua exemplos de código quando relevante usando blocos de código com ```linguagem``` para sintaxe destacada.'
      : ' Include code examples when relevant using code blocks with ```language``` for syntax highlighting.';
  }

  const contentRequirements = enableLatex || enableCodeVisualization
    ? `CRITICAL REQUIREMENTS FOR ALL CONTENT (question, sampleAnswer, evaluationCriteria):
1. ${enableLatex ? 'ALL mathematical expressions MUST be properly wrapped in LaTeX notation' : 'Use clear mathematical notation without special formatting'}
2. ${enableLatex ? 'Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$' : 'Write mathematical expressions in plain text'}
3. ${enableLatex ? 'Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$' : 'Use clear formatting for complex expressions'}
4. ${enableLatex ? 'Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.' : 'Use standard mathematical notation'}
5. ${enableLatex ? 'Add spaces around inline math expressions in text' : 'Ensure clear readability'}
6. ${enableLatex ? 'Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)' : 'Use descriptive language for mathematical concepts'}
7. ${enableCodeVisualization ? 'Include relevant code examples using proper syntax highlighting' : 'Focus on conceptual understanding'}
8. Keep content reasonably concise to avoid truncation
9. Limit evaluationCriteria to 3-4 short, clear points`
    : 'Keep content clear, reasonably concise, and focused on deep understanding. Avoid complex formatting.';

  // Enhanced subject constraint
  const subjectConstraint = language === 'pt-BR'
    ? `RESTRIÇÃO CRÍTICA DE MATÉRIA: Você DEVE criar questões EXCLUSIVAMENTE sobre "${subject}". NÃO crie questões sobre outras matérias como Biologia, Química, Física, História, etc. A questão DEVE estar diretamente relacionada ao tópico específico: "${subject}".`
    : `CRITICAL SUBJECT CONSTRAINT: You MUST create questions EXCLUSIVELY about "${subject}". DO NOT create questions about other subjects like Biology, Chemistry, Physics, History, etc. The question MUST be directly related to the specific topic: "${subject}".`;

  const prompt = customPrompt 
    ? customPrompt.replace('{subject}', subject)
    : `You are a study assistant that creates dissertative questions about ${subject}. ${languageInstruction}${formattingInstructions} 

${subjectConstraint}

${contentRequirements}

Create open-ended questions that require thoughtful analysis and help students develop:
- Deep understanding of core concepts within ${subject}
- Critical thinking and reasoning skills specific to ${subject}
- Ability to explain thought processes and action plans related to ${subject}
- Connection between theory and practice within ${subject}
- Problem-solving methodologies specific to ${subject}

Focus on questions that allow students to demonstrate their understanding through explanation of their reasoning, thought process, and step-by-step approach rather than just providing final answers.

IMPORTANT: The question must be directly about "${subject}" and cannot deviate to other academic subjects or fields.

Return ONLY a JSON object with: question (string), sampleAnswer (string with comprehensive model answer), and evaluationCriteria (array of 3-4 short strings). Do not include any other text or formatting.`;

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
            ? `Crie uma questão dissertativa EXCLUSIVAMENTE sobre "${subject}". A questão DEVE ser especificamente sobre ${subject} e NÃO sobre outras matérias. Torne-a instigante e que exija análise detalhada, focando no processo de pensamento e raciocínio específico de ${subject}. ${enableLatex ? 'Use notação LaTeX correta com espaçamento adequado para expressões matemáticas.' : 'Use linguagem clara e descritiva.'} ${enableCodeVisualization ? 'Inclua exemplos de código quando apropriado.' : ''} Mantenha o conteúdo razoavelmente conciso e ESTRITAMENTE dentro do escopo de ${subject}.`
            : `Create a dissertative question EXCLUSIVELY about "${subject}". The question MUST be specifically about ${subject} and NOT about other subjects. Make it thought-provoking and require detailed analysis, focusing on thought process and reasoning specific to ${subject}. ${enableLatex ? 'Use correct LaTeX notation with proper spacing for mathematical expressions.' : 'Use clear and descriptive language.'} ${enableCodeVisualization ? 'Include code examples when appropriate.' : ''} Keep content reasonably concise and STRICTLY within the scope of ${subject}.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1200,
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

export async function evaluateAnswer(
  question: string, 
  userAnswer: string, 
  correctAnswer: string, 
  apiKey: string, 
  model: string = 'gpt-4o-mini', 
  customPrompt?: string, 
  language: string = 'en-US',
  enableLatex: boolean = false,
  enableCodeVisualization: boolean = false
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro.' 
    : 'Respond in English.';

  // Build formatting instructions based on enabled features
  let formattingInstructions = '';
  
  if (enableLatex) {
    formattingInstructions += language === 'pt-BR'
      ? ' SEMPRE use notação LaTeX correta para expressões matemáticas. Use $...$ para matemática inline e $$...$$ para blocos matemáticos. Exemplos corretos: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANTE: Sempre adicione espaços ao redor de expressões matemáticas inline.'
      : ' ALWAYS use correct LaTeX notation for mathematical expressions. Use $...$ for inline math and $$...$$ for math blocks. Correct examples: $x^2$, $\\frac{a}{b}$, $\\lim_{x \\to 0}$, $$\\int_0^1 x \\, dx$$. IMPORTANT: Always add spaces around inline mathematical expressions.';
  }

  if (enableCodeVisualization) {
    formattingInstructions += language === 'pt-BR'
      ? ' Inclua exemplos de código quando relevante usando blocos de código com ```linguagem``` para sintaxe destacada.'
      : ' Include code examples when relevant using code blocks with ```language``` for syntax highlighting.';
  }

  const contentRequirements = enableLatex || enableCodeVisualization
    ? `CRITICAL REQUIREMENTS for your feedback:
1. ${enableLatex ? 'ALL mathematical expressions MUST be properly wrapped in LaTeX notation' : 'Use clear mathematical notation without special formatting'}
2. ${enableLatex ? 'Use $...$ for inline math: $x^2$, $\\frac{a}{b}$, $\\sin(x)$, $f(x) = x^2$' : 'Write mathematical expressions in plain text'}
3. ${enableLatex ? 'Use $$...$$ for display math: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$' : 'Use clear formatting for complex expressions'}
4. ${enableLatex ? 'Always escape backslashes properly: \\frac, \\lim, \\sin, \\cos, etc.' : 'Use standard mathematical notation'}
5. ${enableLatex ? 'Add spaces around inline math expressions in text' : 'Ensure clear readability'}
6. ${enableLatex ? 'Example: "The function $f(x) = x^2$ is a parabola" (note spaces around $f(x) = x^2$)' : 'Use descriptive language for mathematical concepts'}
7. ${enableCodeVisualization ? 'Include relevant code examples when helpful for explanation' : 'Focus on conceptual understanding'}
8. Keep feedback concise and focused`
    : 'Keep feedback clear, concise, and focused on understanding. Avoid complex formatting.';

  const prompt = customPrompt 
    ? customPrompt
        .replace('{question}', question)
        .replace('{userAnswer}', userAnswer)
        .replace('{modelAnswer}', correctAnswer)
    : `${languageInstruction}${formattingInstructions} 

${contentRequirements}

You are evaluating a student's answer to a dissertative question. Focus on:
- Understanding of core concepts
- Quality of reasoning and thought process
- Clarity of explanation and action plan
- Practical application of knowledge
- Problem-solving approach

Question: ${question}
Student's answer: ${userAnswer}
Model answer: ${correctAnswer}

Provide constructive feedback focusing on the student's reasoning, thought process, and approach. Rate the answer and suggest improvements for their methodology and understanding. Be encouraging but honest.`;

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos útil. Forneça feedback encorajador para respostas corretas e incorretas. Mantenha as respostas concisas e educativas. Foque no processo de pensamento e raciocínio do estudante. ${enableLatex ? 'SEMPRE use notação LaTeX correta com espaçamento adequado para expressões matemáticas.' : 'Use linguagem clara e descritiva.'} ${enableCodeVisualization ? 'Inclua exemplos de código quando útil para explicação.' : ''}`
    : `You are a helpful study assistant. Provide encouraging feedback for both correct and incorrect answers. Keep responses concise and educational. Focus on the student's thought process and reasoning. ${enableLatex ? 'ALWAYS use correct LaTeX notation with proper spacing for mathematical expressions.' : 'Use clear and descriptive language.'} ${enableCodeVisualization ? 'Include code examples when helpful for explanation.' : ''}`;

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
      max_tokens: 600,
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
    ? 'Use linguagem clara e descritiva sem formatação especial.'
    : 'Use clear and descriptive language without special formatting.';

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos que ajuda estudantes a pensar mais profundamente sobre tópicos através de interrogação elaborativa. ${languageInstruction} Mantenha o foco EXCLUSIVAMENTE na matéria "${subject}".`
    : `You are a study assistant that helps students think deeper about topics through elaborative interrogation. ${languageInstruction} Keep the focus EXCLUSIVELY on the subject "${subject}".`;

  const userMessage = language === 'pt-BR'
    ? `Para a matéria "${subject}" e questão "${question}", gere uma pergunta de acompanhamento "por que" que ajude o estudante a pensar mais profundamente sobre os conceitos subjacentes e conexões DENTRO DO ESCOPO de ${subject}. Use linguagem clara e descritiva. A pergunta deve ser EXCLUSIVAMENTE sobre ${subject}.`
    : `For the subject "${subject}" and question "${question}", generate a follow-up "why" question that helps the student think more deeply about the underlying concepts and connections WITHIN THE SCOPE of ${subject}. Use clear and descriptive language. The question must be EXCLUSIVELY about ${subject}.`;

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
  return data.choices[0].message.content;
}

export async function generateRetrievalQuestion(subject: string, previousQuestions: string[], apiKey: string, model: string = 'gpt-4o-mini', language: string = 'en-US'): Promise<any> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const languageInstruction = language === 'pt-BR' 
    ? 'Responda em português brasileiro. Use linguagem clara e descritiva sem formatação especial.'
    : 'Respond in English. Use clear and descriptive language without special formatting.';

  const questionsContext = previousQuestions.length > 0 
    ? (language === 'pt-BR' 
        ? `Questões anteriores cobertas: ${previousQuestions.slice(-5).join(', ')}`
        : `Previous questions covered: ${previousQuestions.slice(-5).join(', ')}`)
    : '';

  // Enhanced subject constraint
  const subjectConstraint = language === 'pt-BR'
    ? `RESTRIÇÃO CRÍTICA DE MATÉRIA: Você DEVE criar questões EXCLUSIVAMENTE sobre "${subject}". NÃO crie questões sobre outras matérias como Biologia, Química, Física, História, etc. A questão DEVE estar diretamente relacionada ao tópico específico: "${subject}".`
    : `CRITICAL SUBJECT CONSTRAINT: You MUST create questions EXCLUSIVELY about "${subject}". DO NOT create questions about other subjects like Biology, Chemistry, Physics, History, etc. The question MUST be directly related to the specific topic: "${subject}".`;

  const systemMessage = language === 'pt-BR'
    ? `Você é um assistente de estudos que cria questões de prática de recuperação sobre ${subject}. ${questionsContext}. ${languageInstruction} 

${subjectConstraint}

REQUISITOS CRÍTICOS PARA TODO CONTEÚDO (questão, opções, explicação, resposta modelo):
1. Use linguagem clara e descritiva sem formatação especial
2. Foque na compreensão conceitual e aplicação prática DENTRO de ${subject}
3. Mantenha o conteúdo conciso para evitar truncamento
4. Crie questões que testem a compreensão profunda de ${subject}

Crie uma questão que teste a recordação de material previamente coberto ou conecte novos conceitos aos antigos DENTRO DO ESCOPO de ${subject}. Retorne APENAS um objeto JSON com: question (string), type (either "multiple-choice" or "dissertative"), e se múltipla escolha: options (array), correctAnswer (number), explanation (string). Se dissertativa: sampleAnswer (string). Não inclua nenhum outro texto ou formatação.`
    : `You are a study assistant that creates retrieval practice questions about ${subject}. ${questionsContext}. ${languageInstruction}

${subjectConstraint}

CRITICAL REQUIREMENTS FOR ALL CONTENT (question, options, explanation, sampleAnswer):
1. Use clear and descriptive language without special formatting
2. Focus on conceptual understanding and practical application WITHIN ${subject}
3. Keep content concise to avoid truncation
4. Create questions that test deep understanding of ${subject}

Create a question that tests recall of previously covered material or connects new concepts to old ones WITHIN THE SCOPE of ${subject}. Return ONLY a JSON object with: question (string), type (either "multiple-choice" or "dissertative"), and if multiple-choice: options (array), correctAnswer (number), explanation (string). If dissertative: sampleAnswer (string). Do not include any other text or formatting.`;

  const userMessage = language === 'pt-BR'
    ? `Crie uma questão de prática de recuperação EXCLUSIVAMENTE sobre "${subject}". A questão DEVE ser especificamente sobre ${subject} e NÃO sobre outras matérias. Use linguagem clara e descritiva. Mantenha o conteúdo conciso e ESTRITAMENTE dentro do escopo de ${subject}.`
    : `Create a retrieval practice question EXCLUSIVELY about "${subject}". The question MUST be specifically about ${subject} and NOT about other subjects. Use clear and descriptive language. Keep content concise and STRICTLY within the scope of ${subject}.`;

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
    ? `Você é um assistente de estudos que sugere contextos específicos para matérias de estudo. ${languageInstruction} Para a matéria fornecida, sugira contextos específicos como livros, capítulos, cursos, ou tópicos específicos que ajudariam a focar o estudo EXCLUSIVAMENTE DENTRO DA MATÉRIA "${subject}". Retorne APENAS um array JSON de strings com 3-5 sugestões específicas e úteis relacionadas a ${subject}.`
    : `You are a study assistant that suggests specific contexts for study subjects. For the given subject, suggest specific contexts like books, chapters, courses, or specific topics that would help focus the study EXCLUSIVELY WITHIN THE SUBJECT "${subject}". Return ONLY a JSON array of strings with 3-5 specific and useful suggestions related to ${subject}.`;

  const userMessage = language === 'pt-BR'
    ? `Sugira contextos específicos para estudar EXCLUSIVAMENTE sobre: ${subject}. As sugestões devem ser APENAS sobre ${subject} e não sobre outras matérias.`
    : `Suggest specific contexts for studying EXCLUSIVELY about: ${subject}. The suggestions must be ONLY about ${subject} and not about other subjects.`;

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
      max_tokens: 400,
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