"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Question } from "@/actions/placement-test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Props = {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  isLoading: boolean;
};

const DIFFICULTY_COLORS = {
  BEGINNER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INTERMEDIATE: "bg-amber-100 text-amber-700 border-amber-200",
  ADVANCED: "bg-rose-100 text-rose-700 border-rose-200",
};

export function PlacementTestQuiz({ questions, onSubmit, isLoading }: Props) {
  const t = useTranslations("placementTest");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const questionText = isRTL
    ? currentQuestion.textAr
    : currentQuestion.text;

  const difficultyLabel = t(
    `quiz.difficulty.${currentQuestion.difficulty.toLowerCase()}`
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex flex-col">
      {/* Top Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              {t("quiz.progress", {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </span>
            <span>
              {t("quiz.answered", { count: answeredCount, total: questions.length })}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Question Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium border",
                DIFFICULTY_COLORS[currentQuestion.difficulty]
              )}
            >
              {difficultyLabel}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.field}
            </Badge>
          </div>

          {/* Question Card */}
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug mb-8">
                {questionText}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    answers[currentQuestion.id] === option.id;
                  const optionText = isRTL ? option.textAr : option.text;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={cn(
                        "w-full text-start px-5 py-4 rounded-xl border-2 transition-all duration-150 font-medium text-sm md:text-base",
                        "hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-card text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex shrink-0 w-7 h-7 rounded-full items-center justify-center text-xs font-bold border-2",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/60 text-muted-foreground"
                          )}
                        >
                          {option.id.toUpperCase()}
                        </span>
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
              {t("quiz.previous")}
            </Button>

            {/* Question Dots */}
            <div className="hidden sm:flex gap-1.5 flex-wrap justify-center max-w-xs">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    i === currentIndex
                      ? "bg-primary scale-125"
                      : answers[q.id]
                      ? "bg-primary/40"
                      : "bg-muted-foreground/30"
                  )}
                  aria-label={`Question ${i + 1}`}
                />
              ))}
            </div>

            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNext} className="gap-1">
                {t("quiz.next")}
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isLoading}
                    className="gap-2 bg-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {t("quiz.submit")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("quiz.submitDialog.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {!allAnswered && (
                        <span className="flex items-center gap-2 text-amber-600 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          {t("quiz.submitDialog.unanswered", {
                            count: questions.length - answeredCount,
                          })}
                        </span>
                      )}
                      {t("quiz.submitDialog.description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("quiz.submitDialog.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onSubmit(answers)}
                      disabled={isLoading}
                    >
                      {t("quiz.submitDialog.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}