// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateQuestion(subject: string, apiKey: string, model: string = "gpt-4o-mini"): Promise<any> {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a study assistant that creates multiple choice questions about ${subject}. Return a JSON object with: question (string), options (array of 4 strings), correctAnswer (number 0-3), and explanation (string explaining why the correct answer is right).`,
        },
        {
          role: "user",
          content: `Create a multiple choice question about ${subject}. Make it challenging but fair.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse OpenAI response: ${e}`);
  }
}

export async function evaluateAnswer(question: string, userAnswer: string, correctAnswer: string, apiKey: string, model: string = "gpt-4o-mini"): Promise<string> {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant. Provide encouraging feedback for both correct and incorrect answers. Keep responses concise and educational.",
        },
        {
          role: "user",
          content: `Question: ${question}\nUser's answer: ${userAnswer}\nCorrect answer: ${correctAnswer}\n\nProvide feedback on the user's answer.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
