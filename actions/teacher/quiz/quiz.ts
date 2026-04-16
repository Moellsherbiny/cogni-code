"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── Get all quizzes for teacher's courses ──────────────────────
export async function getTeacherQuizzes(courseId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.quiz.findMany({
    where: courseId ? { courseId } : undefined,
    include: {
      course: true,
      questions: { include: { options: true } },
      _count: { select: { quizAttempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Get single quiz ────────────────────────────────────────────
export async function getQuizById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { include: { options: true } },
      course: true,
    },
  });
}

// ── Update quiz (title, description, questions) ────────────────
export interface UpdateQuizInput {
  id: string;
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: {
    id?: string; // existing question
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
    options: { id?: string; text: string; isCorrect: boolean }[];
  }[];
}

export async function updateQuiz(input: UpdateQuizInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  // Delete existing questions + options (cascade), then recreate
  await prisma.question.deleteMany({ where: { quizId: input.id } });

  const quiz = await prisma.quiz.update({
    where: { id: input.id },
    data: {
      title: input.title,
      description: input.description,
      difficulty: input.difficulty,
      questions: {
        create: input.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: { create: q.options.map(({ text, isCorrect }) => ({ text, isCorrect })) },
        })),
      },
    },
    include: { questions: { include: { options: true } } },
  });

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/quizzes/${input.id}`);
  return { success: true, quiz };
}

// ── Delete quiz ────────────────────────────────────────────────S
export async function deleteQuiz(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  await prisma.quiz.delete({ where: { id } });
  revalidatePath("/teacher/quizzes");
  return { success: true };
}