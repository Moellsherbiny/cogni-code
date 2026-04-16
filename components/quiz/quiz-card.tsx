"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, BookOpen, Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";

// Types for better DX
interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: any[];
  _count?: { quizAttempts: number };
  course: { title: string } | null;
}

const difficultyVariants = {
  EASY: "secondary", // Greenish in custom themes, or use "outline"
  MEDIUM: "default",
  HARD: "destructive",
} as const;

export function QuizCard({
  quiz,
  onDelete,
}: {
  quiz: Quiz;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("quiz");

  return (
    <Card className="overflow-hidden border-muted/60 transition-all duration-200 hover:shadow-md">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {quiz.course?.title && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {quiz.course.title}
              </p>
            )}
            <CardTitle className="line-clamp-1 text-lg leading-none">
              {quiz.title}
            </CardTitle>
          </div>
          <Badge 
            variant={difficultyVariants[quiz.difficulty]} 
            className="capitalize shadow-none"
          >
            {t(quiz.difficulty.toLowerCase())}
          </Badge>
        </div>
        {quiz.description && (
          <CardDescription className="line-clamp-2 pt-1 text-sm">
            {quiz.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-5 pb-4">
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {quiz.questions.length} {t("questions")}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            {quiz._count?.quizAttempts ?? 0} {t("attempts")}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2">
          
          <Button asChild variant="outline" size="sm" className="h-8 gap-2">
            <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              {t("edit")}
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(quiz.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t("delete")}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}