"use server"

import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";
import {prisma} from "@/lib/prisma";
const genAI = new GoogleGenAI(
    {apiKey:process.env.GEMINI_API_KEY!});

export async function processContent(formData: FormData, locale: string) {
  const content = formData.get("content") as string;
  if (!content) return { error: "Content is required" };

  const prompt = `
    Analyze the following content in ${locale === 'ar' ? 'Arabic' : 'English'}.
    1. Provide a concise summary.
    2. Create a hierarchical mind map structure in JSON format.
    
    Return ONLY a JSON object with this structure:
    {
      "summary": "string",
      "mindMap": { "label": "Root", "children": [{ "label": "Child 1", "children": [] }] }
    }

    Content: ${content}
  `;

  try {
    const result = await genAI.models.generateContent({
        contents: prompt,
        model: "gemini-flash-latest",
    });
    const text = await result.text || "";
    
    // Clean JSON if Gemini adds markdown code blocks
    const cleanJson = text.replace(/```json|```/g, "");
    const data = JSON.parse(cleanJson);

    const record = await prisma.summary.create({
      data: {
        content,
        summary: data.summary,
        mindMap: data.mindMap,
      },
    });

    revalidatePath(`/${locale}`);
    return { success: true, data: record };
  } catch (error) {
    console.error(error);
    return { error: "Failed to process request" };
  }
}