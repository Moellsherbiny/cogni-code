import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuizForAttempt } from "@/actions/student/quiz";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart3, CheckCircle2 } from "lucide-react";

const difficultyColor = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
};

export default async function QuizIntroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const quiz = await getQuizForAttempt((await params).id).catch(() => null);
  if (!quiz) notFound();

  const alreadyAttempted = quiz.quizAttempts.length > 0;
  const attempt = quiz.quizAttempts[0];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{quiz.course.title}</p>
        <h1 className="text-3xl font-medium">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-muted-foreground">{quiz.description}</p>
        )}
        <span
          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
            difficultyColor[quiz.difficulty]
          }`}
        >
          {quiz.difficulty}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl text-center space-y-1">
          <BookOpen className="w-5 h-5 mx-auto text-muted-foreground" />
          <p className="text-2xl font-medium">{quiz.questions.length}</p>
          <p className="text-xs text-muted-foreground">Questions</p>
        </div>
        <div className="p-4 border rounded-xl text-center space-y-1">
          <Clock className="w-5 h-5 mx-auto text-muted-foreground" />
          <p className="text-2xl font-medium">
            ~{Math.ceil(quiz.questions.length * 1.5)}
          </p>
          <p className="text-xs text-muted-foreground">Minutes</p>
        </div>
        <div className="p-4 border rounded-xl text-center space-y-1">
          <BarChart3 className="w-5 h-5 mx-auto text-muted-foreground" />
          <p className="text-2xl font-medium">
            {alreadyAttempted ? `${attempt.score}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Your score</p>
        </div>
      </div>

      {/* Rules */}
      <div className="p-5 border rounded-xl space-y-3">
        <h2 className="font-medium">Before you start</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "You can only attempt this quiz once.",
            "Each question has one correct answer.",
            "You can review your answers after submission.",
            "Your score is added to the leaderboard.",
          ].map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      {alreadyAttempted ? (
        <div className="space-y-3">
          <div className="p-4 border rounded-xl bg-muted/40 text-center">
            <p className="text-sm text-muted-foreground">
              You scored{" "}
              <span className="font-semibold text-foreground">
                {attempt.score}%
              </span>{" "}
              on this quiz.
            </p>
          </div>
          <Link href={`/student/quizzes/results/${attempt.id}`}>
            <Button variant="outline" className="w-full">
              Review your answers
            </Button>
          </Link>
        </div>
      ) : (
        <Link href={`/student/quizzes/${(await params).id}/attempt`}>
          <Button className="w-full" size="lg">
            Start Quiz
          </Button>
        </Link>
      )}
    </div>
  );
}