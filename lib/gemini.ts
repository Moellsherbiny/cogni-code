// lib/gemini.ts
import { 
  GoogleGenAI, 
  ThinkingLevel, 
  
} from '@google/genai';

// إعداد المفتاح من متغيرات البيئة
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const aiModel = new GoogleGenAI({ apiKey });

export const assessmentSchema = {
  type: "object",
  properties: {
    nextQuestion: { 
      type: "string", 
      description: "السؤال التالي الموجه للطالب بناءً على مستواه" 
    },
    isTestFinished: { 
      type: "boolean", 
      description: "هل اكتمل تقييم مستوى الطالب؟" 
    },
    suggestedLevel: { 
      type: "string", 
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      description: "المستوى المقترح للطالب في حال انتهاء الاختبار"
    },
    reasoning: { 
      type: "string", 
      description: "تحليل منطقي لسبب اختيار هذا المستوى" 
    }
  },
  required: ["nextQuestion", "isTestFinished"],
};

// Gemini 3 settings
export const geminiModel = 'gemini-flash-latest';

export const config = {
  thinkingConfig: {
    thinkingLevel: ThinkingLevel.MEDIUM,
  },
  responseMimeType: 'application/json',
  responseSchema: assessmentSchema,
};

export async function generateContent(messages: string[]) {
    const response = await aiModel.models.generateContent({
        model: geminiModel,
        contents: messages.map(text => ({
            role: 'user',
            parts: [{ text }],
        })),
        config,
    })

    const result = await response.text;
    return result
}