"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Map, BookOpen, Users } from "lucide-react";
import Link from "next/link";

import { LearningPathForm } from "./learning-path-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseOption {
  id: string;
  title: string;
  thumbnail?: string | null;
}

interface EditLearningPathClientProps {
  initialData: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    courses: CourseOption[];
  };
  availableCourses: CourseOption[];
}

export function EditLearningPathClient({
  initialData,
  availableCourses,
}: EditLearningPathClientProps) {
  const t = useTranslations("teacher.learningPathForm");
  const tList = useTranslations("teacher.learningPaths");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-background px-4 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* Back */}
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
          {tList("title")}
        </Link>

        {/* Page title */}
        <div
          className={cn(
            "flex items-start gap-4 mb-8",
            isRtl && "flex-row-reverse"
          )}
        >
          {initialData.thumbnail ? (
            <img
              src={initialData.thumbnail}
              alt=""
              className="w-14 h-14 rounded-xl object-cover border border-border/60 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-500/20 to-indigo-500/10 flex items-center justify-center shrink-0 border border-border/60">
              <Map className="w-6 h-6 text-violet-500/60" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {t("editTitle")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-sm">
              {initialData.title}
            </p>
          </div>
        </div>

        {/* Two-column: form left, enrolled courses summary right */}
        <div className="grid gap-6 md:grid-cols-[1fr_300px] items-start">
          {/* ── Form ── */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
            <LearningPathForm
              availableCourses={availableCourses}
              initialData={initialData}
              onSuccess={() => router.push("/teacher/learning-paths")}
            />
          </div>

          {/* ── Current courses sidebar ── */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-4">
            <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                {tList("courses", { count: initialData.courses.length })}
              </p>
            </div>

            {initialData.courses.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {t("noCoursesAdded")}
              </p>
            ) : (
              <div className="space-y-2">
                {initialData.courses.map((course, index) => (
                  <div
                    key={course.id}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/40 bg-muted/30",
                      isRtl && "flex-row-reverse"
                    )}
                  >
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold shrink-0 w-5 h-5 justify-center p-0 rounded-full"
                    >
                      {index + 1}
                    </Badge>
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt=""
                        className="w-7 h-7 rounded-md object-cover shrink-0 border border-border/40"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-muted shrink-0 flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-muted-foreground/40" />
                      </div>
                    )}
                    <span className="text-xs font-medium truncate flex-1">
                      {course.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground/60 leading-snug">
              {t("coursesHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}