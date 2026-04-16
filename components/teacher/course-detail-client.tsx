"use client";
 
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseBuilder } from "./course-builder";
import { cn } from "@/lib/utils";
 
interface Lesson {
  id: string; title: string; type: "VIDEO" | "TEXT" | "MATERIAL";
  order: number; content?: string | null; videoUrl?: string | null;
  materialUrl?: string | null; transcript?: string | null;
}
interface Module {
  id: string; title: string; description?: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; order: number; lessons: Lesson[];
}
interface Course {
  id: string; title: string; description?: string | null; thumbnail?: string | null;
  modules: Module[];
}
 
export function CourseDetailClient({ course }: { course: Course }) {
  const t = useTranslations("teacher.courses");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
 
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          href="/teacher/courses"
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-6",
            isRtl && "flex-row-reverse"
          )}
        >
          {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          {t("title")}
        </Link>
 
        {/* Course header */}
        <div className={cn("flex items-start justify-between gap-4 mb-8 flex-wrap", isRtl && "flex-row-reverse")}>
          <div className="flex items-start gap-4">
            {course.thumbnail && (
              <img src={course.thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover border border-border/60 shrink-0" />
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{course.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
          >
            <Pencil className="w-3.5 h-3.5" />{t("edit")}
          </Button>
        </div>
 
        {/* Module / lesson builder */}
        <CourseBuilder courseId={course.id} initialModules={course.modules} />
      </div>
    </div>
  );
}