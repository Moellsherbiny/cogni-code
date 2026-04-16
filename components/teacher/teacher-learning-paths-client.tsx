"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Plus, Map, Users, BookOpen, Pencil, Trash2, ArrowLeft, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LearningPathForm } from "./learning-path-form";
import { deleteLearningPath } from "@/actions/teacher/teacher";
import { cn } from "@/lib/utils";

interface PathCourse { id: string; title: string; thumbnail?: string | null; }
interface LearningPath {
  id: string; title: string; description?: string | null; thumbnail?: string | null;
  courses: { course: PathCourse; order: number }[];
  _count: { progress: number };
}
interface AvailableCourse { id: string; title: string; thumbnail?: string | null; }

// ─── Learning Paths List ──────────────────────────────────────────────────────

export function TeacherLearningPathsClient({
  paths,
  availableCourses,
}: {
  paths: LearningPath[];
  availableCourses: AvailableCourse[];
}) {
  const t = useTranslations("teacher.learningPaths");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [localPaths, setLocalPaths] = useState(paths);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteLearningPath(id);
        setLocalPaths((p) => p.filter((lp) => lp.id !== id));
        toast.success("Learning path deleted.");
      } catch { toast.error("Failed to delete."); }
    });
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mx-auto max-w-5xl mb-8">
        <div className={cn("flex items-start justify-between gap-4 flex-wrap", isRtl && "flex-row-reverse")}>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
          </div>
          <Button className="gap-2" onClick={() => router.push("/teacher/learning-paths/new")}>
            <Plus className="w-4 h-4" />{t("new")}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        {localPaths.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-28 text-muted-foreground">
            <Map className="w-14 h-14 opacity-20" />
            <p className="text-sm">{t("empty")}</p>
            <Button onClick={() => router.push("/teacher/learning-paths/new")}>{t("new")}</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localPaths.map((path) => (
              <div key={path.id}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-36 bg-muted overflow-hidden">
                  {path.thumbnail ? (
                    <img src={path.thumbnail} alt={path.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-violet-500/10 to-indigo-500/5">
                      <Map className="w-8 h-8 text-violet-500/30" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-4 gap-3">
                  <h3 className="font-bold text-sm leading-snug line-clamp-2">{path.title}</h3>
                  {path.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{path.description}</p>
                  )}

                  {/* Course thumbnails strip */}
                  {path.courses.length > 0 && (
                    <div className={cn("flex items-center gap-1 flex-wrap", isRtl && "flex-row-reverse")}>
                      {path.courses.slice(0, 4).map(({ course }) => (
                        course.thumbnail ? (
                          <img key={course.id} src={course.thumbnail} alt="" className="w-6 h-6 rounded-md object-cover border border-border/40" />
                        ) : (
                          <div key={course.id} className="w-6 h-6 rounded-md bg-muted border border-border/40 flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-muted-foreground/40" />
                          </div>
                        )
                      ))}
                      {path.courses.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{path.courses.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className={cn("flex items-center gap-3 text-xs text-muted-foreground mt-auto", isRtl && "flex-row-reverse")}>
                    <span className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
                      <BookOpen className="w-3.5 h-3.5" />
                      {t("courses", { count: path.courses.length })}
                    </span>
                    <span className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
                      <Users className="w-3.5 h-3.5" />
                      {t("students", { count: path._count.progress })}
                    </span>
                  </div>

                  <div className={cn("flex gap-2 mt-1", isRtl && "flex-row-reverse")}>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs h-8"
                      onClick={() => router.push(`/teacher/learning-paths/${path.id}/edit`)}>
                      <Pencil className="w-3.5 h-3.5" />{t("edit")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 hover:text-destructive hover:border-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(path.id)}>{t("delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Learning Path Page ───────────────────────────────────────────────────

export function NewLearningPathPageClient({
  availableCourses,
}: {
  availableCourses: AvailableCourse[];
}) {
  const t = useTranslations("teacher.learningPathForm");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-lg">
        <Link
          href="/teacher/learning-paths"
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8",
            isRtl && "flex-row-reverse"
          )}
        >
          {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          Back to learning paths
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-6">
            {t("createTitle")}
          </h1>
          <LearningPathForm
            availableCourses={availableCourses}
            onSuccess={(id) => router.push("/teacher/learning-paths")}
          />
        </div>
      </div>
    </div>
  );
}