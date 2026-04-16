"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateQuizFromGemini } from "@/lib/ai/quiz";
import { auth } from "@/auth";

export interface GenerateQuizInput {
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionCount: number;
  courseId: string;
  language: string;
  additionalInstructions?: string;
}

export async function generateAndSaveQuiz(input: GenerateQuizInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  // 1. Call Gemini
  const generated = await generateQuizFromGemini({
    topic: input.topic,
    difficulty: input.difficulty,
    questionCount: input.questionCount,
    language: input.language,
    additionalInstructions: input.additionalInstructions,
  });

  // 2. Save to DB with nested create
  const quiz = await prisma.quiz.create({
    data: {
      title: generated.title,
      description: generated.description,
      difficulty: input.difficulty,
      courseId: input.courseId,
      questions: {
        create: generated.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: {
            create: q.options,
          },
        })),
      },
    },
    include: {
      questions: { include: { options: true } },
    },
  });

  revalidatePath("/teacher/quizzes");
  return { success: true, quizId: quiz.id };
}