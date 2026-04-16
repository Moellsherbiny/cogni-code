"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

import { CourseForm } from "./course-form";
import { LinkLearningPathPanel } from "./link-learning-path-panel";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
}

interface LinkedPath {
  learningPathId: string;
  order: number;
  learningPath: { id: string; title: string; thumbnail: string | null };
}

interface AvailablePath {
  id: string;
  title: string;
  thumbnail: string | null;
  _count: { courses: number };
}

interface EditCourseClientProps {
  course: Course;
  linkedPaths: LinkedPath[];
  availablePaths: AvailablePath[];
}

export function EditCourseClient({
  course,
  linkedPaths,
  availablePaths,
}: EditCourseClientProps) {
  const t = useTranslations("teacher.courseForm");
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
          href={`/teacher/courses/${course.id}`}
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
          {course.title}
        </Link>

        {/* Page title */}
        <h1 className="text-2xl font-black tracking-tight text-foreground mb-8">
          {t("editTitle")}
        </h1>

        {/* Two-column layout on md+ */}
        <div className="grid gap-6 md:grid-cols-[1fr_340px] items-start">
          {/* ── Left: course details form ── */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
            <div
              className={cn(
                "flex items-center gap-2 mb-5",
                isRtl && "flex-row-reverse"
              )}
            >
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                {t("editTitle")}
              </h2>
            </div>
            <CourseForm
              initialData={course}
              onSuccess={(id) => router.push(`/teacher/courses/${id}`)}
            />
          </div>

          {/* ── Right: learning path links ── */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
            <LinkLearningPathPanel
              courseId={course.id}
              linkedPaths={linkedPaths}
              availablePaths={availablePaths}
            />
          </div>
        </div>
      </div>
    </div>
  );
}