"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Users, Pencil, Trash2, LayoutList } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { deleteCourse } from "@/actions/teacher/teacher";

interface Course {
  id: string; title: string; description?: string | null; thumbnail?: string | null;
  _count: { modules: number; enrollments: number };
}

export function TeacherCoursesClient({ courses }: { courses: Course[] }) {
  const t = useTranslations("teacher.courses");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [localCourses, setLocalCourses] = useState(courses);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCourse(id);
        setLocalCourses((p) => p.filter((c) => c.id !== id));
        toast.success("Course deleted.");
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
          <Button className="gap-2" onClick={() => router.push("/teacher/courses/new")}>
            <Plus className="w-4 h-4" />{t("new")}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        {localCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-28 text-muted-foreground">
            <BookOpen className="w-14 h-14 opacity-20" />
            <p className="text-sm">{t("empty")}</p>
            <Button onClick={() => router.push("/teacher/courses/new")}>{t("new")}</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localCourses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-36 bg-muted overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                      <BookOpen className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  <h3 className="font-bold text-sm leading-snug line-clamp-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                  )}
                  <div className={cn("flex items-center gap-3 text-xs text-muted-foreground mt-auto", isRtl && "flex-row-reverse")}>
                    <span className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
                      <LayoutList className="w-3.5 h-3.5" />
                      {t("modules", { count: course._count.modules })}
                    </span>
                    <span className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
                      <Users className="w-3.5 h-3.5" />
                      {t("enrollments", { count: course._count.enrollments })}
                    </span>
                  </div>
                  <div className={cn("flex gap-2 mt-1", isRtl && "flex-row-reverse")}>
                    <Button size="sm" className="flex-1 gap-1.5 text-xs h-8"
                      onClick={() => router.push(`/teacher/courses/${course.id}`)}>
                      <LayoutList className="w-3.5 h-3.5" />{t("manage")}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                      onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}>
                      <Pencil className="w-3.5 h-3.5" />
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
                            onClick={() => handleDelete(course.id)}>{t("delete")}</AlertDialogAction>
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