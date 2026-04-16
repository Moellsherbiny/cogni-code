"use client";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
function QuizTeacherHeader() {
  const t = useTranslations("quiz");
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-medium">{t("title")}</h1>
      <Button asChild>
        <Link href="/teacher/quizzes/new">
          <Sparkles className="w-4 h-4 me-2" />
          {t("generate")}
        </Link>
      </Button>
    </div>
  );
}

export default QuizTeacherHeader;
