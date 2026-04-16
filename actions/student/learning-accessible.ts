"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function markLessonComplete(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.progress.upsert({
    where: {
      studentId_lessonId: {
        studentId: session.user.id,
        lessonId,
      },
    },
    create: {
      studentId: session.user.id,
      lessonId,
      completed: true,
    },
    update: { completed: true },
  });

  revalidatePath(`/courses/${courseId}/learn-accessible`);
  return { success: true };
}

export async function askGeminiAboutLesson(
  lessonContent: string,
  lessonTitle: string,
  userQuestion: string,
  locale: string,
): Promise<{ answer: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const langInstruction =
    locale === "ar"
      ? "Please respond in Arabic (العربية). Be warm, clear, and use simple language."
      : "Please respond in English. Be warm, clear, and concise.";

  const prompt = `
You are a compassionate, patient educational assistant helping a visually impaired student learn through audio.

${langInstruction}

LESSON TITLE: ${lessonTitle}

LESSON CONTENT:
${lessonContent.slice(0, 4000)}

STUDENT QUESTION: ${userQuestion}

Instructions:
- Answer ONLY based on the lesson content above
- Keep the answer focused and easy to follow when read aloud
- Avoid markdown, bullet points, or special characters in your answer since it will be spoken
- Use natural spoken language
- If the question is unrelated to the lesson, gently redirect to the lesson topic
- Keep your response to 3-5 sentences maximum for easy audio consumption
`.trim();

  try {
    const result = await genAI.models.generateContent(
        {
            model: "gemini-flash-latest",
            contents: prompt
        }
    );
    return { answer: result.text?.trim() || "" };
  } catch {
    return {
      answer:
        locale === "ar"
          ? "عذراً، لم أتمكن من معالجة سؤالك الآن. يرجى المحاولة مرة أخرى."
          : "Sorry, I couldn't process your question right now. Please try again.",
    };
  }
}

export async function generateLessonSummary(
  lessonContent: string,
  lessonTitle: string,
  locale: string,
): Promise<{ summary: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");


  const langInstruction =
    locale === "ar" ? "أجب باللغة العربية فقط." : "Respond in English only.";

  const prompt = `
${langInstruction}

Summarize this lesson in 3-4 sentences that can be read aloud to a visually impaired student.
Use natural, spoken language. No markdown, no lists, no special characters.

LESSON TITLE: ${lessonTitle}
LESSON CONTENT: ${lessonContent.slice(0, 3000)}
`.trim();

  try {
    const result = await genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents:prompt
    });
    return { summary: result.text?.trim() || "" };
  } catch {
    return {
      summary:
        locale === "ar"
          ? "لا يمكن إنشاء الملخص الآن."
          : "Unable to generate summary at this time.",
    };
  }
}
