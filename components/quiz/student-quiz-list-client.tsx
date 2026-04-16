"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentQuizzes } from "@/actions/student/quiz";
import { useTranslations } from "next-intl";

type Quiz = Awaited<ReturnType<typeof getStudentQuizzes>>[number];

const difficultyColor = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
};

export function StudentQuizListClient({ initialQuizzes }: { initialQuizzes: Quiz[] }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const t = useTranslations("quiz");
  const filtered = initialQuizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === "ALL" || q.difficulty === difficulty;
    return matchSearch && matchDiff;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-medium">{t("title")}</h1>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All levels</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No quizzes found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => {
            const attempted = quiz.quizAttempts.length > 0;
            const attempt = quiz.quizAttempts[0];
            return (
              <div
                key={quiz.id}
                className="p-5 border rounded-xl flex flex-col gap-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      {quiz.course.title}
                    </p>
                    <h3 className="font-medium leading-snug">{quiz.title}</h3>
                  </div>
                  {attempted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      difficultyColor[quiz.difficulty]
                    )}
                  >
                    {quiz.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {quiz._count.questions} questions
                  </span>
                  {attempted && (
                    <Badge variant="outline" className="text-xs">
                      Score: {attempt.score}%
                    </Badge>
                  )}
                </div>

                <Link
                  href={
                    attempted
                      ? `/student/quizzes/results/${attempt.id}`
                      : `/student/quizzes/${quiz.id}`
                  }
                  className="mt-auto"
                >
                  <Button
                    variant={attempted ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {attempted ? "View results" : "Start quiz"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}