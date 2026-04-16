"use server";

import { prisma } from "@/lib/prisma";

export async function createQuiz(data: any) {
  try {
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        courseId: data.courseId,
        questions: {
          create: data.questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: {
              create: q.options.map((opt: any) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return { success: true, quiz };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create quiz" };
  }
}