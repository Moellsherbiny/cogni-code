import { getStudentQuizzes } from "@/actions/student/quiz";
import { StudentQuizListClient } from "@/components/quiz/student-quiz-list-client";

export default async function StudentQuizzesPage() {
  const quizzes = await getStudentQuizzes();

  return (
    <div className="p-6 space-y-6">
      <StudentQuizListClient initialQuizzes={quizzes} />
    </div>
  );
}