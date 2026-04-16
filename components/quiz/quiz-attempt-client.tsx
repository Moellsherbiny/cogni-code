"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAttempt } from "@/actions/student/quiz";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, SendHorizonal } from "lucide-react";

type Quiz = Awaited<ReturnType<typeof import("@/actions/student/quiz").getQuizForAttempt>>;

export function QuizAttemptClient({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const questions = quiz.questions;
  const question = questions[current];
  const totalAnswered = Object.keys(answers).length;
  const progress = Math.round((totalAnswered / questions.length) * 100);
  const isLast = current === questions.length - 1;
  const allAnswered = totalAnswered === questions.length;

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!allAnswered) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitQuizAttempt({ quizId: quiz.id, answers });
      router.push(`/student/quizzes/results/${result.attemptId}`);
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Top bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{quiz.title}</span>
          <span>
            {current + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question card */}
      <div className="flex-1 p-6 border rounded-2xl space-y-6">
        <p className="text-lg font-medium leading-snug">{question.text}</p>

        <div className="space-y-3">
          {question.options.map((option) => {
            const selected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => selectOption(question.id, option.id)}
                className={cn(
                  "w-full text-start px-4 py-3 rounded-xl border text-sm transition-all",
                  selected
                    ? "border-primary bg-primary/8 font-medium"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                )}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Question dots */}
        <div className="flex-1 flex justify-center gap-1.5 flex-wrap">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                i === current
                  ? "bg-primary scale-125"
                  : answers[q.id]
                  ? "bg-primary/40"
                  : "bg-muted-foreground/25"
              )}
            />
          ))}
        </div>

        {isLast ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
          >
            <SendHorizonal className="w-4 h-4 me-2" />
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button onClick={() => setCurrent((c) => c + 1)}>
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Unanswered warning */}
      {isLast && !allAnswered && (
        <p className="text-center text-xs text-muted-foreground">
          {questions.length - totalAnswered} question
          {questions.length - totalAnswered > 1 ? "s" : ""} unanswered
        </p>
      )}
    </div>
  );
}