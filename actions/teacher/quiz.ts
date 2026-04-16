"use server"

import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function getTeacherQuizzes(teacherId: string) {
  const quizzes = await prisma.quiz.findMany({
    where: {
        course:{
            teacherId: teacherId
        }
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true } } }
  });

  return quizzes;
}

export async function generateQuizAction(formData: FormData) {
  const topic = formData.get("topic") as string;
  const count = formData.get("count") as string;
  const difficulty = formData.get("difficulty") as string;
  const courseId = formData.get("courseId") as string;
  const locale = formData.get("language") as string;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", 
      contents: [{
        role: "user",
        parts: [{
          text: `Create a ${difficulty} quiz about ${topic} with ${count} questions in ${locale === 'ar' ? 'Arabic' : 'English'}.`
        }]
      }],
      config: {
        // Forces the model to return a structured JSON object
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            questions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  text: { type: "STRING" },
                  type: { type: "STRING", enum: ["MULTIPLE_CHOICE", "TRUE_FALSE"] },
                  options: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        text: { type: "STRING" },
                        isCorrect: { type: "BOOLEAN" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const quizData = JSON.parse(response.text || "");

    const newQuiz = await prisma.quiz.create({
      data: {
        title: quizData.title,
        description: quizData.description,
        courseId: courseId,
        questions: {
          create: quizData.questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: {
              create: q.options.map((o: any) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      }
    });

    revalidatePath(`/${locale}/dashboard`);
    return { success: true, quizId: newQuiz.id };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { success: false, error: "Failed to generate quiz" };
  }
}