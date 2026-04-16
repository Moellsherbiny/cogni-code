import { notFound } from "next/navigation";
import Link from "next/link";
import { getAttemptResult } from "@/actions/student/quiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
  return (
    <div className={cn("text-6xl font-semibold tabular-nums", color)}>
      {score}%
    </div>
  );
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const attempt = await getAttemptResult((await params).attemptId).catch(() => null);
  if (!attempt) notFound();

  const { quiz, score } = attempt;
  const total = quiz.questions.length;
  const correct = Math.round((score / 100) * total);

  const passed = score >= 60;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Score summary */}
      <div className="p-8 border rounded-2xl flex flex-col items-center gap-3 text-center">
        <Trophy
          className={cn(
            "w-10 h-10",
            passed ? "text-yellow-500" : "text-muted-foreground"
          )}
        />
        <ScoreRing score={score} />
        <p className="text-muted-foreground text-sm">
          {correct} out of {total} correct
        </p>
        <Badge variant={passed ? "default" : "destructive"}>
          {passed ? "Passed" : "Failed"}
        </Badge>
      </div>

      {/* Answer review */}
      <div className="space-y-4">
        <h2 className="font-medium text-lg">Review</h2>
        {quiz.questions.map((question, idx) => {
          const correctOption = question.options.find((o) => o.isCorrect);
          return (
            <div key={question.id} className="p-5 border rounded-xl space-y-3">
              <p className="text-sm font-medium">
                {idx + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
                      option.isCorrect
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "border border-transparent text-muted-foreground"
                    )}
                  >
                    {option.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                    )}
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/student/quizzes" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to quizzes
          </Button>
        </Link>
        <Link href="/student/leaderboard" className="flex-1">
          <Button className="w-full">
            <Trophy className="w-4 h-4 me-2" />
            Leaderboard
          </Button>
        </Link>
      </div>
    </div>
  );
}