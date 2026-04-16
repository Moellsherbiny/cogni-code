import { getTranslations } from "next-intl/server";
import { getTeacherQuizzes } from "@/actions/teacher/quiz/quiz";
import { QuizListClient } from "@/components/quiz/quiz-list-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import QuizTeacherHeader from "@/components/quiz/quiz-teacher-header";

export default async function QuizzesPage() {
  const quizzes = await getTeacherQuizzes();

  return (
    <div className="p-6 space-y-6">
      <QuizTeacherHeader />
      <QuizListClient initialQuizzes={quizzes} />
    </div>
  );
}