"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ── All quizzes for courses the student is enrolled in ─────────
export async function getStudentQuizzes(filters?: {
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  search?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const quizzes = await prisma.quiz.findMany({
    where: {
      course: {
        enrollments: { some: { studentId: session.user.id } },
      },
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
      ...(filters?.search && {
        title: { contains: filters.search, mode: "insensitive" },
      }),
    },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
      // Check if this student already attempted
      quizAttempts: {
        where: { studentId: session.user.id },
        select: { id: true, score: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return quizzes;
}

// ── Single quiz with questions (no correct answers exposed) ────
export async function getQuizForAttempt(quizId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify student is enrolled in the course
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      course: {
        enrollments: { some: { studentId: session.user.id } },
      },
    },
    include: {
      course: { select: { id: true, title: true } },
      questions: {
        include: {
          options: {
            select: {
              id: true,
              text: true,
              // isCorrect intentionally omitted — sent after submission
            },
          },
        },
      },
      quizAttempts: {
        where: { studentId: session.user.id },
        select: { id: true, score: true },
      },
    },
  });

  if (!quiz) throw new Error("Quiz not found or not enrolled");
  return quiz;
}

// ── Submit attempt ─────────────────────────────────────────────
export interface SubmitAttemptInput {
  quizId: string;
  // Map of questionId → selected optionId
  answers: Record<string, string>;
}

export async function submitQuizAttempt(input: SubmitAttemptInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const studentId = session.user.id;

  // Block re-attempts
  const existing = await prisma.quizAttempt.findUnique({
    where: { quizId_studentId: { quizId: input.quizId, studentId } },
  });
  if (existing) throw new Error("Already attempted");

  // Fetch correct answers
  const questions = await prisma.question.findMany({
    where: { quizId: input.quizId },
    include: { options: { select: { id: true, isCorrect: true } } },
  });

  // Score calculation
  let correct = 0;
  for (const question of questions) {
    const selectedOptionId = input.answers[question.id];
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    if (selectedOption?.isCorrect) correct++;
  }

  const score = questions.length > 0
    ? Math.round((correct / questions.length) * 100)
    : 0;

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: { quizId: input.quizId, studentId, score },
  });

  // Update leaderboard (upsert total score)
  const totalScore = await prisma.quizAttempt.aggregate({
    where: { studentId },
    _sum: { score: true },
  });

  await prisma.leaderboard.upsert({
    where: { studentId },
    create: { studentId, score: totalScore._sum.score ?? score },
    update: { score: totalScore._sum.score ?? score },
  });

  revalidatePath("/student/quizzes");
  return { attemptId: attempt.id, score, correct, total: questions.length };
}

// ── Get attempt result with correct answers (post-submission) ──
export async function getAttemptResult(attemptId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      id: attemptId,
      studentId: session.user.id, // students can only see their own
    },
    include: {
      quiz: {
        include: {
          course: { select: { title: true } },
          questions: {
            include: {
              options: true, // full options including isCorrect for review
            },
          },
        },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found");
  return attempt;
}