"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { generateAndSaveQuiz } from "@/actions/teacher/quiz/generate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  courseId: string;
  courses: { id: string; title: string }[];
}

export function GenerateQuizForm({ courseId, courses }: Props) {
  const t = useTranslations("quiz");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    topic: "",
    difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
    questionCount: 5,
    courseId,
    language: locale === "ar" ? "Arabic" : "English",
    additionalInstructions: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateAndSaveQuiz(form);
      toast.success("Quiz generated successfully!");
      router.push(`/teacher/quizzes/${result.quizId}/edit`);
    } catch (err) {
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Course */}
      <div className="space-y-2">
        <Label>{t("course")}</Label>
        <Select
          value={form.courseId}
          onValueChange={(v) => setForm({ ...form, courseId: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic */}
      <div className="space-y-2">
        <Label>{t("topic")}</Label>
        <Input
          required
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          placeholder={locale === "ar" ? "محتوى الاختبار" : "Quiz Content"}
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>{t("difficulty")}</Label>
        <Select
          value={form.difficulty}
          onValueChange={(v) =>
            setForm({ ...form, difficulty: v as "EASY" | "MEDIUM" | "HARD" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EASY">{t("easy")}</SelectItem>
            <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
            <SelectItem value="HARD">{t("hard")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question count */}
      <div className="space-y-2">
        <Label>{t("questionCount")}</Label>
        <Input
          type="number"
          min={1}
          max={20}
          value={form.questionCount}
          onChange={(e) =>
            setForm({ ...form, questionCount: Number(e.target.value) })
          }
        />
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label>{t("language")}</Label>
        <Select
          value={form.language}
          onValueChange={(v) => setForm({ ...form, language: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Arabic">العربية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Additional instructions */}
      <div className="space-y-2">
        <Label>{t("additionalInstructions")}</Label>
        <Textarea
          value={form.additionalInstructions}
          onChange={(e) =>
            setForm({ ...form, additionalInstructions: e.target.value })
          }
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin me-2" />
        ) : (
          <Sparkles className="w-4 h-4 me-2" />
        )}
        {loading ? t("generating") : t("generate")}
      </Button>
    </form>
  );
}