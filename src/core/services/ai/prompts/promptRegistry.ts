/**
 * Centralized AI prompt registry with multi-language support
 */

import { Language } from '../../../types';

export interface PromptTemplate {
  id: string;
  type: 'multipleChoice' | 'dissertative' | 'evaluation' | 'elaborative' | 'retrieval';
  content: Record<Language, string>;
  variables: string[];
  description: Record<Language, string>;
}

/**
 * Core prompt templates for all AI providers
 */
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  multipleChoice: {
    id: 'multipleChoice',
    type: 'multipleChoice',
    variables: ['contextsList', 'instructionsList', 'difficulty'],
    description: {
      'en-US': 'Generate multiple choice questions with 4 options',
      'pt-BR': 'Gerar questões de múltipla escolha com 4 opções'
    },
    content: {
      'en-US': `You are an expert educational content creator. Your task is to generate questions that align with the specific academic content, level, and scope defined by the study contexts.

**Input Format:**
The user has provided study contexts that define the scope and academic level for question generation.

**Your Task:** 
Generate educational questions based exclusively on the subjects, topics, and academic level indicated by the provided contexts.

**Context Interpretation Guidelines:**

1. **Exam/Test Contexts** (e.g., "ENEM", "Vestibulinho ETEC", "simulado"):
   - Generate questions covering subjects typically found in that specific exam
   - Match the difficulty level and question style of the referenced exam
   - Include all relevant subject areas for that exam type

2. **Subject + Exam Contexts** (e.g., "Matemática" + "Vestibulinho ETEC"):
   - Focus specifically on the named subject within the context of the specified exam
   - Maintain the academic level and scope appropriate for that exam

3. **Book/Academic Material Contexts** (e.g., book title + author + chapter):
   - Generate questions based on the specific academic content from the referenced material
   - Focus on the particular chapter, section, or scope mentioned
   - Match the academic level of the source material

**STUDY CONTEXTS:**
{contextsList}

**SPECIAL INSTRUCTIONS:**
{instructionsList}

**CRITICAL CODE REQUIREMENTS:**
- If your question references code, pseudocode, algorithms, or any programming content, you MUST include the actual code in the question
- Use proper code formatting with markdown code blocks and language specification
- Never ask about "the following code" or "the code above" without actually providing the code
- For programming questions, always include complete, runnable code examples
- Use \`\`\`language syntax for code blocks (e.g., \`\`\`python, \`\`\`javascript, \`\`\`java)

QUALITY STANDARDS:
- Focus on conceptual understanding, not memorization
- Test application of knowledge and problem-solving skills
- Use real-world scenarios when appropriate
- Ensure all options are plausible but only one is correct
- Avoid trick questions or ambiguous wording
- Make the question challenging but fair for {difficulty} level
- Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts
- All generated questions must directly relate to the provided contexts
- Maintain consistency with the academic level implied by the contexts

CONTENT REQUIREMENTS:
1. Use clear, well-formatted Markdown for all content
2. Use **bold** for emphasis and *italics* for subtle emphasis
3. Use \`inline code\` for technical terms, formulas, or specific values
4. Use code blocks with language specification for code examples:
   \`\`\`python
   # Your code here
   print("Hello World")
   \`\`\`
5. Use numbered lists or bullet points for structured information
6. For mathematical expressions, use clear descriptive text or inline code
7. Keep content well-organized and easy to read
8. Ensure questions are appropriate for the educational setting indicated by the contexts
9. **MANDATORY**: If asking about code output, behavior, or analysis, include the complete code in the question

RESPONSE FORMAT:
Return ONLY a JSON object wrapped in \`\`\`json code fences with:
- question: string (with Markdown formatting, including code blocks when needed)
- options: array of 4 strings (with Markdown formatting)
- correctAnswer: number (0-3)
- explanation: string (detailed explanation with Markdown formatting)
- difficulty: string ("{difficulty}")

Example format for code questions:
\`\`\`json
{
  "question": "**What is the output of the following Python code?**\\n\\n\`\`\`python\\nfor i in range(3):\\n    print(i * 2)\\n\`\`\`",
  "options": ["0\\n2\\n4", "1\\n2\\n3", "0\\n1\\n2", "2\\n4\\n6"],
  "correctAnswer": 0,
  "explanation": "**Explanation:** The code iterates through range(3) which gives values 0, 1, 2. Each value is multiplied by 2 and printed, resulting in 0, 2, 4.",
  "difficulty": "{difficulty}"
}
\`\`\`

Example format for non-code questions:
\`\`\`json
{
  "question": "**Question text here**",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "explanation": "**Explanation:** The correct answer is...",
  "difficulty": "{difficulty}"
}
\`\`\``,
      'pt-BR': `Você é um especialista em criação de conteúdo educacional. Sua tarefa é gerar questões que se alinhem com o conteúdo acadêmico específico, nível e escopo definidos pelos contextos de estudo.

**Formato de Entrada:**
O usuário forneceu contextos de estudo que definem o escopo e nível acadêmico para geração de questões.

**Sua Tarefa:**
Gere questões educacionais baseadas exclusivamente nas matérias, tópicos e nível acadêmico indicados pelos contextos fornecidos: {studyArea}

**Diretrizes de Interpretação de Contexto:**

1. **Contextos de Exame/Teste** (ex: "ENEM", "Vestibulinho ETEC", "simulado"):
   - Gere questões cobrindo matérias tipicamente encontradas nesse exame específico
   - Corresponda ao nível de dificuldade e estilo de questão do exame referenciado
   - Inclua todas as áreas de matéria relevantes para esse tipo de exame

2. **Contextos de Matéria + Exame** (ex: "Matemática" + "Vestibulinho ETEC"):
   - Foque especificamente na matéria nomeada dentro do contexto do exame especificado
   - Mantenha o nível acadêmico e escopo apropriados para esse exame

3. **Contextos de Livro/Material Acadêmico** (ex: título do livro + autor + capítulo):
   - Gere questões baseadas no conteúdo acadêmico específico do material referenciado
   - Foque no capítulo, seção ou escopo particular mencionado
   - Corresponda ao nível acadêmico do material fonte

**CONTEXTOS DE ESTUDO:**
{contextsList}

**INSTRUÇÕES ESPECIAIS:**
{instructionsList}

**REQUISITOS CRÍTICOS PARA CÓDIGO:**
- Se sua questão referenciar código, pseudocódigo, algoritmos ou qualquer conteúdo de programação, você DEVE incluir o código real na questão
- Use formatação adequada de código com blocos de código markdown e especificação de linguagem
- Nunca pergunte sobre "o seguinte código" ou "o código acima" sem realmente fornecer o código
- Para questões de programação, sempre inclua exemplos de código completos e executáveis
- Use a sintaxe \`\`\`linguagem para blocos de código (ex: \`\`\`python, \`\`\`javascript, \`\`\`java)

PADRÕES DE QUALIDADE:
- Foque na compreensão conceitual, não na memorização
- Teste aplicação de conhecimento e habilidades de resolução de problemas
- Use cenários do mundo real quando apropriado
- Garanta que todas as opções sejam plausíveis, mas apenas uma seja correta
- Evite pegadinhas ou redação ambígua
- Torne a questão desafiadora mas justa para o nível {difficulty}
- Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo
- Todas as questões geradas devem se relacionar diretamente com os contextos fornecidos
- Mantenha consistência com o nível acadêmico implícito pelos contextos

REQUISITOS DE CONTEÚDO:
1. Use formatação Markdown clara e bem estruturada para todo o conteúdo
2. Use **negrito** para ênfase e *itálico* para ênfase sutil
3. Use \`código inline\` para termos técnicos, fórmulas ou valores específicos
4. Use blocos de código com especificação de linguagem para exemplos de código:
   \`\`\`python
   # Seu código aqui
   print("Olá Mundo")
   \`\`\`
5. Use listas numeradas ou com marcadores para informações estruturadas
6. Para expressões matemáticas, use texto descritivo claro ou código inline
7. Mantenha o conteúdo bem organizado e fácil de ler
8. Garanta que as questões sejam apropriadas para o ambiente educacional indicado pelos contextos
9. **OBRIGATÓRIO**: Se perguntando sobre saída de código, comportamento ou análise, inclua o código completo na questão

FORMATO DE RESPOSTA:
Retorne APENAS um objeto JSON envolvido em \`\`\`json code fences com:
- question: string (com formatação Markdown, incluindo blocos de código quando necessário)
- options: array de 4 strings (com formatação Markdown)
- correctAnswer: number (0-3)
- explanation: string (explicação detalhada com formatação Markdown)
- difficulty: string ("{difficulty}")

Formato de exemplo para questões de código:
\`\`\`json
{
  "question": "**Qual é a saída do seguinte código Python?**\\n\\n\`\`\`python\\nfor i in range(3):\\n    print(i * 2)\\n\`\`\`",
  "options": ["0\\n2\\n4", "1\\n2\\n3", "0\\n1\\n2", "2\\n4\\n6"],
  "correctAnswer": 0,
  "explanation": "**Explicação:** O código itera através de range(3) que fornece valores 0, 1, 2. Cada valor é multiplicado por 2 e impresso, resultando em 0, 2, 4.",
  "difficulty": "{difficulty}"
}
\`\`\`

Formato de exemplo para questões não-código:
\`\`\`json
{
  "question": "**Texto da questão aqui**",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correctAnswer": 1,
  "explanation": "**Explicação:** A resposta correta é...",
  "difficulty": "{difficulty}"
}
\`\`\``
    }
  },

  dissertative: {
    id: 'dissertative',
    type: 'dissertative',
    variables: ['contextsList', 'instructionsList', 'difficulty'],
    description: {
      'en-US': 'Generate open-ended dissertative questions',
      'pt-BR': 'Gerar questões dissertativas abertas'
    },
    content: {
      'en-US': `You are an expert educational content creator. Your task is to generate dissertative questions that align with the specific academic content, level, and scope defined by the study contexts.

**Your Task:**
Generate educational dissertative questions based exclusively on the subjects, topics, and academic level indicated by the provided contexts.

**STUDY CONTEXTS:**
{contextsList}

**SPECIAL INSTRUCTIONS:**
{instructionsList}

**CRITICAL CODE REQUIREMENTS:**
- If your question references code, pseudocode, algorithms, or any programming content, you MUST include the actual code in the question
- Use proper code formatting with markdown code blocks and language specification
- Never ask about "the following code" or "the code above" without actually providing the code
- For programming questions, always include complete, runnable code examples
- Use \`\`\`language syntax for code blocks (e.g., \`\`\`python, \`\`\`javascript, \`\`\`java)

QUALITY STANDARDS:
- Encourage analytical thinking and reasoning
- Require explanation of thought processes and methodologies
- Focus on understanding connections between concepts
- Allow for multiple valid approaches while maintaining academic rigor
- Promote critical evaluation and synthesis of information
- Appropriate for {difficulty} level
- Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts
- All generated questions must directly relate to the provided contexts
- Maintain consistency with the academic level implied by the contexts

CONTENT REQUIREMENTS:
1. Use clear, well-formatted Markdown for all content
2. Use **bold** for emphasis and *italics* for subtle emphasis
3. Use \`inline code\` for technical terms, formulas, or specific values
4. Use code blocks with language specification for code examples:
   \`\`\`python
   # Your code here
   print("Hello World")
   \`\`\`
5. Use numbered lists or bullet points for structured information
6. For mathematical expressions, use clear descriptive text or inline code
7. Keep content well-organized and easy to read
8. **MANDATORY**: If asking about code analysis, behavior, or review, include the complete code in the question

RESPONSE FORMAT:
Return ONLY a JSON object wrapped in \`\`\`json code fences with:
- question: string (with Markdown formatting, including code blocks when needed)
- sampleAnswer: string (comprehensive model answer with Markdown formatting)
- evaluationCriteria: array of 3-4 short evaluation criteria strings
- difficulty: string ("{difficulty}")

Example format for code questions:
\`\`\`json
{
  "question": "**Analyze the following Python function and explain its purpose, efficiency, and potential improvements:**\\n\\n\`\`\`python\\ndef find_max(numbers):\\n    max_val = numbers[0]\\n    for num in numbers:\\n        if num > max_val:\\n            max_val = num\\n    return max_val\\n\`\`\`",
  "sampleAnswer": "**Purpose:** This function finds the maximum value in a list of numbers...\\n\\n**Efficiency:** The algorithm has O(n) time complexity...",
  "evaluationCriteria": ["Correctly identifies function purpose", "Analyzes time complexity", "Suggests meaningful improvements", "Uses proper technical terminology"],
  "difficulty": "{difficulty}"
}
\`\`\`

Example format for non-code questions:
\`\`\`json
{
  "question": "**Question text here**",
  "sampleAnswer": "**Sample comprehensive answer...**",
  "evaluationCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
  "difficulty": "{difficulty}"
}
\`\`\``,
      'pt-BR': `Você é um especialista em criação de conteúdo educacional. Sua tarefa é gerar questões dissertativas que se alinhem com o conteúdo acadêmico específico, nível e escopo definidos pelos contextos de estudo.

**Sua Tarefa:**
Gere questões dissertativas educacionais baseadas exclusivamente nas matérias, tópicos e nível acadêmico indicados pelos contextos fornecidos.

**CONTEXTOS DE ESTUDO:**
{contextsList}

**INSTRUÇÕES ESPECIAIS:**
{instructionsList}

**REQUISITOS CRÍTICOS PARA CÓDIGO:**
- Se sua questão referenciar código, pseudocódigo, algoritmos ou qualquer conteúdo de programação, você DEVE incluir o código real na questão
- Use formatação adequada de código com blocos de código markdown e especificação de linguagem
- Nunca pergunte sobre "o seguinte código" ou "o código acima" sem realmente fornecer o código
- Para questões de programação, sempre inclua exemplos de código completos e executáveis
- Use a sintaxe \`\`\`linguagem para blocos de código (ex: \`\`\`python, \`\`\`javascript, \`\`\`java)

PADRÕES DE QUALIDADE:
- Encoraje pensamento analítico e raciocínio
- Exija explicação de processos de pensamento e metodologias
- Foque na compreensão de conexões entre conceitos
- Permita múltiplas abordagens válidas mantendo rigor acadêmico
- Promova avaliação crítica e síntese de informações
- Apropriado para o nível {difficulty}
- Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo
- Todas as questões geradas devem se relacionar diretamente com os contextos fornecidos
- Mantenha consistência com o nível acadêmico implícito pelos contextos

REQUISITOS DE CONTEÚDO:
1. Use formatação Markdown clara e bem estruturada para todo o conteúdo
2. Use **negrito** para ênfase e *itálico* para ênfase sutil
3. Use \`código inline\` para termos técnicos, fórmulas ou valores específicos
4. Use blocos de código com especificação de linguagem para exemplos de código:
   \`\`\`python
   # Seu código aqui
   print("Olá Mundo")
   \`\`\`
5. Use listas numeradas ou com marcadores para informações estruturadas
6. Para expressões matemáticas, use texto descritivo claro ou código inline
7. Mantenha o conteúdo bem organizado e fácil de ler
8. **OBRIGATÓRIO**: Se perguntando sobre análise de código, comportamento ou revisão, inclua o código completo na questão

FORMATO DE RESPOSTA:
Retorne APENAS um objeto JSON envolvido em \`\`\`json code fences com:
- question: string (com formatação Markdown, incluindo blocos de código quando necessário)
- sampleAnswer: string (resposta modelo abrangente com formatação Markdown)
- evaluationCriteria: array de 3-4 strings curtas de critérios de avaliação
- difficulty: string ("{difficulty}")

Formato de exemplo para questões de código:
\`\`\`json
{
  "question": "**Analise a seguinte função Python e explique seu propósito, eficiência e possíveis melhorias:**\\n\\n\`\`\`python\\ndef encontrar_maximo(numeros):\\n    valor_max = numeros[0]\\n    for num in numeros:\\n        if num > valor_max:\\n            valor_max = num\\n    return valor_max\\n\`\`\`",
  "sampleAnswer": "**Propósito:** Esta função encontra o valor máximo em uma lista de números...\\n\\n**Eficiência:** O algoritmo tem complexidade de tempo O(n)...",
  "evaluationCriteria": ["Identifica corretamente o propósito da função", "Analisa complexidade de tempo", "Sugere melhorias significativas", "Usa terminologia técnica adequada"],
  "difficulty": "{difficulty}"
}
\`\`\`

Formato de exemplo para questões não-código:
\`\`\`json
{
  "question": "**Texto da questão aqui**",
  "sampleAnswer": "**Resposta modelo abrangente...**",
  "evaluationCriteria": ["Critério 1", "Critério 2", "Critério 3"],
  "difficulty": "{difficulty}"
}
\`\`\``
    }
  },

  evaluation: {
    id: 'evaluation',
    type: 'evaluation',
    variables: ['question', 'userAnswer', 'correctAnswer', 'type'],
    description: {
      'en-US': 'Evaluate student answers and provide constructive feedback',
      'pt-BR': 'Avaliar respostas de estudantes e fornecer feedback construtivo'
    },
    content: {
      'en-US': `You are an expert educational evaluator. Provide constructive, encouraging feedback on the student's answer.

EVALUATION PRINCIPLES:
- Be encouraging and supportive while being honest about accuracy
- Focus on the student's reasoning process and methodology
- Provide specific suggestions for improvement
- Recognize partial understanding and correct elements
- Guide the student toward better understanding
- Use positive reinforcement for good thinking patterns

CONTENT REQUIREMENTS:
1. Use clear, well-formatted Markdown for all content
2. Use **bold** for emphasis and *italics* for subtle emphasis
3. Use \`inline code\` for technical terms or specific values
4. Use numbered lists or bullet points for structured feedback
5. Use > blockquotes for important insights or key points
6. Keep feedback concise but comprehensive

Question: {question}
Student's Answer: {userAnswer}
{correctAnswer}
Question Type: {type}

RESPONSE FORMAT:
Provide detailed feedback in Markdown format that includes:
- Assessment of correctness and understanding
- Specific strengths in the student's response
- Areas for improvement with actionable suggestions
- Encouragement and next steps for learning`,
      'pt-BR': `Você é um avaliador educacional especialista. Forneça feedback construtivo e encorajador sobre a resposta do estudante.

PRINCÍPIOS DE AVALIAÇÃO:
- Seja encorajador e solidário sendo honesto sobre a precisão
- Foque no processo de raciocínio e metodologia do estudante
- Forneça sugestões específicas para melhoria
- Reconheça compreensão parcial e elementos corretos
- Guie o estudante em direção a melhor compreensão
- Use reforço positivo para bons padrões de pensamento

REQUISITOS DE CONTEÚDO:
1. Use formatação Markdown clara e bem estruturada para todo o conteúdo
2. Use **negrito** para ênfase e *itálico* para ênfase sutil
3. Use \`código inline\` para termos técnicos ou valores específicos
4. Use listas numeradas ou com marcadores para feedback estruturado
5. Use > blockquotes para insights importantes ou pontos-chave
6. Mantenha o feedback conciso mas abrangente

Questão: {question}
Resposta do Estudante: {userAnswer}
{correctAnswer}
Tipo de Questão: {type}

FORMATO DE RESPOSTA:
Forneça feedback detalhado em formato Markdown que inclua:
- Avaliação de correção e compreensão
- Pontos fortes específicos na resposta do estudante
- Áreas para melhoria com sugestões acionáveis
- Encorajamento e próximos passos para aprendizado`
    }
  },

  elaborative: {
    id: 'elaborative',
    type: 'elaborative',
    variables: ['contextsList', 'question'],
    description: {
      'en-US': 'Generate elaborative interrogation follow-up questions',
      'pt-BR': 'Gerar questões de acompanhamento de interrogação elaborativa'
    },
    content: {
      'en-US': `You are an expert in elaborative interrogation techniques. Generate a thoughtful "why" or "how" follow-up question that helps the student think deeper about the underlying concepts within the study contexts.

FOCUS: Generate questions that promote deeper understanding of concepts by encouraging students to explain reasoning, connections, and underlying principles.

Original Question: {question}

**STUDY CONTEXTS:**
{contextsList}

REQUIREMENTS:
- Ask "why" or "how" questions that probe deeper understanding
- Focus on underlying principles and reasoning
- Encourage connections to broader concepts within the study contexts
- Keep the question clear and focused
- Use Markdown formatting when appropriate

Generate a single follow-up question that encourages elaborative thinking about the concepts involved.`,
      'pt-BR': `Você é um especialista em técnicas de interrogação elaborativa. Gere uma questão de acompanhamento "por que" ou "como" que ajude o estudante a pensar mais profundamente sobre os conceitos subjacentes dentro dos contextos de estudo.

FOCO: Gere questões que promovam compreensão mais profunda dos conceitos encorajando estudantes a explicar raciocínio, conexões e princípios subjacentes.

Questão Original: {question}

**CONTEXTOS DE ESTUDO:**
{contextsList}

REQUISITOS:
- Faça perguntas "por que" ou "como" que sondem compreensão mais profunda
- Foque em princípios subjacentes e raciocínio
- Encoraje conexões com conceitos mais amplos dentro dos contextos de estudo
- Mantenha a questão clara e focada
- Use formatação Markdown quando apropriado

Gere uma única questão de acompanhamento que encoraje pensamento elaborativo sobre os conceitos envolvidos.`
    }
  },

  retrieval: {
    id: 'retrieval',
    type: 'retrieval',
    variables: ['contextsList', 'previousQuestions'],
    description: {
      'en-US': 'Generate retrieval practice questions based on previous content',
      'pt-BR': 'Gerar questões de prática de recuperação baseadas em conteúdo anterior'
    },
    content: {
      'en-US': `You are an expert in retrieval practice techniques. Create a question that tests recall of previously covered material or connects new concepts to previously learned ones based on the study contexts.

**Your Task:**
Generate retrieval practice questions based exclusively on the subjects, topics, and academic level indicated by the provided contexts.

**STUDY CONTEXTS:**
{contextsList}

Previous Questions Context: {previousQuestions}

**CRITICAL CODE REQUIREMENTS:**
- If your question references code, pseudocode, algorithms, or any programming content, you MUST include the actual code in the question
- Use proper code formatting with markdown code blocks and language specification
- Never ask about "the following code" or "the code above" without actually providing the code
- For programming questions, always include complete, runnable code examples
- Use \`\`\`language syntax for code blocks (e.g., \`\`\`python, \`\`\`javascript, \`\`\`java)

RETRIEVAL PRACTICE PRINCIPLES:
- Test recall of key concepts from previous material
- Connect new information to previously learned concepts
- Vary question formats to strengthen different retrieval pathways
- Focus on spaced repetition of important concepts
- Encourage active recall rather than recognition
- Generate questions that accurately reflect the subject matter, difficulty level, and scope defined by the study contexts
- All generated questions must directly relate to the provided contexts

CONTENT REQUIREMENTS:
1. Use clear, well-formatted Markdown for all content
2. Use **bold** for emphasis and *italics* for subtle emphasis
3. Use \`inline code\` for technical terms or specific values
4. Use code blocks with language specification for code examples
5. Keep content concise to avoid truncation
6. **MANDATORY**: If asking about code output, behavior, or analysis, include the complete code in the question

RESPONSE FORMAT:
Return ONLY a JSON object wrapped in \`\`\`json code fences with:
- question: string (with Markdown formatting, including code blocks when needed)
- type: "multipleChoice" or "dissertative"
- If multipleChoice: options (array), correctAnswer (number), explanation (string)
- If dissertative: sampleAnswer (string)

Choose the most appropriate question type based on the content and learning objectives.`,
      'pt-BR': `Você é um especialista em técnicas de prática de recuperação. Crie uma questão que teste a recordação de material previamente coberto ou conecte novos conceitos aos previamente aprendidos baseado nos contextos de estudo.

**Sua Tarefa:**
Gere questões de prática de recuperação baseadas exclusivamente nas matérias, tópicos e nível acadêmico indicados pelos contextos fornecidos.

**CONTEXTOS DE ESTUDO:**
{contextsList}

Contexto de Questões Anteriores: {previousQuestions}

**REQUISITOS CRÍTICOS PARA CÓDIGO:**
- Se sua questão referenciar código, pseudocódigo, algoritmos ou qualquer conteúdo de programação, você DEVE incluir o código real na questão
- Use formatação adequada de código com blocos de código markdown e especificação de linguagem
- Nunca pergunte sobre "o seguinte código" ou "o código acima" sem realmente fornecer o código
- Para questões de programação, sempre inclua exemplos de código completos e executáveis
- Use a sintaxe \`\`\`linguagem para blocos de código (ex: \`\`\`python, \`\`\`javascript, \`\`\`java)

PRINCÍPIOS DE PRÁTICA DE RECUPERAÇÃO:
- Teste recordação de conceitos-chave do material anterior
- Conecte novas informações a conceitos previamente aprendidos
- Varie formatos de questão para fortalecer diferentes caminhos de recuperação
- Foque na repetição espaçada de conceitos importantes
- Encoraje recordação ativa em vez de reconhecimento
- Gere questões que reflitam com precisão a matéria, nível de dificuldade e escopo definidos pelos contextos de estudo
- Todas as questões geradas devem se relacionar diretamente com os contextos fornecidos

REQUISITOS DE CONTEÚDO:
1. Use formatação Markdown clara e bem estruturada para todo o conteúdo
2. Use **negrito** para ênfase e *itálico* para ênfase sutil
3. Use \`código inline\` para termos técnicos ou valores específicos
4. Use blocos de código com especificação de linguagem para exemplos de código
5. Mantenha o conteúdo conciso para evitar truncamento
6. **OBRIGATÓRIO**: Se perguntando sobre saída de código, comportamento ou análise, inclua o código completo na questão

FORMATO DE RESPOSTA:
Retorne APENAS um objeto JSON envolvido em \`\`\`json code fences com:
- question: string (com formatação Markdown, incluindo blocos de código quando necessário)
- type: "multipleChoice" ou "dissertative"
- Se múltipla escolha: options (array), correctAnswer (number), explanation (string)
- Se dissertativa: sampleAnswer (string)

Escolha o tipo de questão mais apropriado baseado no conteúdo e objetivos de aprendizado.`
    }
  }
};

/**
 * Get a prompt template by ID and language
 */
export function getPromptTemplate(id: string, language: Language): string {
  const template = PROMPT_TEMPLATES[id];
  if (!template) {
    throw new Error(`Prompt template not found: ${id}`);
  }
  
  return template.content[language] || template.content['en-US'];
}

/**
 * Replace variables in a prompt template
 */
export function replacePromptVariables(
  prompt: string, 
  variables: Record<string, string>
): string {
  let result = prompt;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  return result;
}

/**
 * Get all available prompt templates
 */
export function getAllPromptTemplates(): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES);
}

/**
 * Get prompt templates by type
 */
export function getPromptTemplatesByType(type: PromptTemplate['type']): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES).filter(template => template.type === type);
}

/**
 * Validate prompt template variables
 */
export function validatePromptVariables(
  templateId: string, 
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const template = PROMPT_TEMPLATES[templateId];
  if (!template) {
    return { valid: false, missing: [] };
  }
  
  const missing = template.variables.filter(variable => !variables[variable]);
  return { valid: missing.length === 0, missing };
}
