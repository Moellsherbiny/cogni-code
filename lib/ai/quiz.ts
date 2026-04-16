import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});


export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: {
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
    options: { text: string; isCorrect: boolean }[];
  }[];
}

export async function generateQuizFromGemini(params: {
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionCount: number;
  language: string;
  additionalInstructions?: string;
}): Promise<GeneratedQuiz> {
  const prompt = `
You are an educational quiz generator. Generate a quiz with the following specs:

- Topic: ${params.topic}
- Difficulty: ${params.difficulty}
- Number of questions: ${params.questionCount}
- Language: ${params.language}
${params.additionalInstructions ? `- Additional instructions: ${params.additionalInstructions}` : ""}

Return ONLY a valid JSON object matching this exact structure:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "text": "Question text",
      "type": "MULTIPLE_CHOICE",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ]
    },
    {
      "text": "True/False question",
      "type": "TRUE_FALSE",
      "options": [
        { "text": "True", "isCorrect": true },
        { "text": "False", "isCorrect": false }
      ]
    }
  ]
}

Rules:
- Each MULTIPLE_CHOICE question must have exactly 4 options, exactly 1 correct
- Each TRUE_FALSE question must have exactly 2 options (True/False), exactly 1 correct
- All text must be in the specified language
- Return ONLY the JSON, no markdown, no explanation
`;

  const result = await genAI.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt 
});
  const text = result.text?.trim() || "";

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");

  return JSON.parse(cleaned) as GeneratedQuiz;
}