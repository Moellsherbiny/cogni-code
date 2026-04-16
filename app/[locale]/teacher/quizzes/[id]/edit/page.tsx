import { notFound } from "next/navigation";
import { getQuizById } from "@/actions/teacher/quiz/quiz";
import { QuizEditForm } from "@/components/quiz/quiz-edit-form";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const quiz = await getQuizById((await params).id);
  if (!quiz) notFound();

  return (
    <div className="p-6 space-y-6">
      <QuizEditForm quiz={quiz} />
    </div>
  );
}