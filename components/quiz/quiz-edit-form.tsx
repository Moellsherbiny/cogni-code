"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateQuiz, UpdateQuizInput } from "@/actions/teacher/quiz/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type QuizWithQuestions = {
  id: string;
  title: string;
  description: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: {
    id: string;
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
    options: { id: string; text: string; isCorrect: boolean }[];
  }[];
};

export function QuizEditForm({ quiz }: { quiz: QuizWithQuestions }) {
  const t = useTranslations("quiz");
  const router = useRouter();

  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [difficulty, setDifficulty] = useState(quiz.difficulty);
  const [questions, setQuestions] = useState(
    quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
    }))
  );
  const [saving, setSaving] = useState(false);

  function updateQuestion(idx: number, patch: Partial<(typeof questions)[0]>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        id: "",
        text: "",
        type: "MULTIPLE_CHOICE",
        options: [
          { id: "", text: "", isCorrect: true },
          { id: "", text: "", isCorrect: false },
          { id: "", text: "", isCorrect: false },
          { id: "", text: "", isCorrect: false },
        ],
      },
    ]);
  }

  function updateOption(
    qIdx: number,
    oIdx: number,
    patch: Partial<{ text: string; isCorrect: boolean }>
  ) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIdx
          ? q
          : {
              ...q,
              options: q.options.map((o, j) =>
                j === oIdx ? { ...o, ...patch } : o
              ),
            }
      )
    );
  }

  function setCorrect(qIdx: number, oIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIdx
          ? q
          : {
              ...q,
              options: q.options.map((o, j) => ({
                ...o,
                isCorrect: j === oIdx,
              })),
            }
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateQuiz({ id: quiz.id, title, description, difficulty, questions });
      toast.success("Quiz updated!");
      router.push("/teacher/quizzes");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-medium">{t("edit")}</h1>

      {/* Header fields */}
      <div className="space-y-4 p-6 border rounded-xl">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("difficulty")}</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as typeof difficulty)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">{t("easy")}</SelectItem>
              <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
              <SelectItem value="HARD">{t("hard")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="p-6 border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {t("question")} {qIdx + 1} ·{" "}
              {q.type === "MULTIPLE_CHOICE" ? t("multipleChoice") : t("trueFalse")}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(qIdx)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("question")}</Label>
            <Textarea
              value={q.text}
              onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("options")}</Label>
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(qIdx, oIdx)}
                  className="shrink-0"
                >
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      opt.isCorrect
                        ? "text-green-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
                <Input
                  value={opt.text}
                  onChange={(e) =>
                    updateOption(qIdx, oIdx, { text: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addQuestion} className="w-full">
        <Plus className="w-4 h-4 me-2" /> {t("addQuestion")}
      </Button>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : t("saveChanges")}
      </Button>
    </div>
  );
}