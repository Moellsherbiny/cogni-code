"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LearningPathForm } from "./learning-path-form";
import { cn } from "@/lib/utils";

interface CourseOption {
  id: string;
  title: string;
  thumbnail?: string | null;
}

export function NewLearningPathClient({
  availableCourses,
}: {
  availableCourses: CourseOption[];
}) {
  const t = useTranslations("teacher.learningPathForm");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-background px-4 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-lg">
        <Link
          href="/teacher/learning-paths"
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8",
            isRtl && "flex-row-reverse"
          )}
        >
          {isRtl ? (
            <ArrowRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
          {useTranslations("teacher.learningPaths")("title")}
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-6">
            {t("createTitle")}
          </h1>
          <LearningPathForm
            availableCourses={availableCourses}
            onSuccess={() => router.push("/teacher/learning-paths")}
          />
        </div>
      </div>
    </div>
  );
}