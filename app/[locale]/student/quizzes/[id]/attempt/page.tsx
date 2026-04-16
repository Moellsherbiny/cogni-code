import { notFound, redirect } from "next/navigation";
import { getQuizForAttempt } from "@/actions/student/quiz";
import { QuizAttemptClient } from "@/components/student/quiz-attempt-client";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getQuizForAttempt(id).catch(() => null);
  if (!quiz) notFound();

  // Already attempted — redirect to results
  if (quiz.quizAttempts.length > 0) {
    redirect(`/student/quizzes/results/${quiz.quizAttempts[0].id}`);
  }

  return <QuizAttemptClient quiz={quiz} />;
}
