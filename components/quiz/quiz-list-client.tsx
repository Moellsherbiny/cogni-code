"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteQuiz } from "@/actions/teacher/quiz/quiz";
import { QuizCard } from "./quiz-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search } from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: { id: string }[];
  course: { id: string; title: string } | null;
  _count: { quizAttempts: number };
};

interface Props {
  initialQuizzes: Quiz[];
}

export function QuizListClient({ initialQuizzes }: Props) {
  const t = useTranslations("quiz");

  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Filtering ──────────────────────────────────────────────
  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "ALL" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // ── Delete ─────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteQuiz(pendingDeleteId);
      // Optimistic remove
      setQuizzes((prev) => prev.filter((q) => q.id !== pendingDeleteId));
      toast.success("Quiz deleted.");
    } catch {
      toast.error("Failed to delete quiz.");
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <>
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
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All levels</SelectItem>
            <SelectItem value="EASY">{t("easy")}</SelectItem>
            <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
            <SelectItem value="HARD">{t("hard")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          {quizzes.length === 0 ? t("noQuizzes") : "No quizzes match your filters."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDelete={(id) => setPendingDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}