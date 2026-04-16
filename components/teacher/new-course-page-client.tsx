"use client";
 
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CourseForm } from "./course-form";
import { cn } from "@/lib/utils";
 
export function NewCoursePageClient() {
  const t = useTranslations("teacher.courseForm");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
 
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-lg">
        {/* Back link */}
        <Link
          href="/teacher/courses"
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8",
            isRtl && "flex-row-reverse"
          )}
        >
          {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          Back to courses
        </Link>
 
        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-6">
            {t("createTitle")}
          </h1>
          <CourseForm
            onSuccess={(courseId) => router.push(`/teacher/courses/${courseId}`)}
          />
        </div>
      </div>
    </div>
  );
}
 