"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { BookOpen, Play, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EnrolledCourse } from "@/actions/student/courses";

// ─── Status helpers ───────────────────────────────────────────────────────────

function useStatusConfig(percent: number) {
  const t = useTranslations("courses");
  const locale = useLocale();
  if (percent === 100)
    return {
      label: t("completed"),
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      bar: "bg-emerald-500",
    };
  if (percent > 0)
    return {
      label: t("inProgress"),
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      bar: "bg-blue-500",
    };
  return {
    label: t("notStarted"),
    className:
      "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/40",
  };
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: EnrolledCourse }) {
  const t = useTranslations("courses");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";
  const status = useStatusConfig(course.progressPercent);

  const actionLabel =
    course.progressPercent === 0
      ? t("startLearning")
      : course.progressPercent === 100
        ? t("completed")
        : t("continueLearning");

  const ActionIcon =
    course.progressPercent === 100 ? CheckCircle2 : Play;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden",
        "shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-muted overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
            <BookOpen className="w-10 h-10 text-primary/30" />
          </div>
        )}

        {/* Status badge */}
        <span
          className={cn(
            "absolute top-3 text-[11px] font-semibold px-2 py-0.5 rounded-full",
            isRtl ? "right-3" : "left-3",
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Teacher */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isRtl && "flex-row-reverse"
          )}
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={course.teacherImage ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {course.teacherName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span>{course.teacherName}</span>
        </div>

        {/* Lessons count */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs text-muted-foreground",
            isRtl && "flex-row-reverse"
          )}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>
            {t("lessons", {
              completed: course.completedLessons,
              total: course.totalLessons,
            })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress
            value={course.progressPercent}
            className="h-1.5 bg-muted"
          />
          <p className="text-[11px] text-muted-foreground">
            {t("progress", { percent: course.progressPercent })}
          </p>
        </div>

        {/* Enrolled date */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto",
            isRtl && "flex-row-reverse"
          )}
        >
          <Clock className="w-3 h-3" />
          <span>
            {t("enrolledOn")}:{" "}
            {formatDistanceToNow(new Date(course.enrolledAt), {
              addSuffix: true,
              locale: isRtl ? ar : enUS,
            })}
          </span>
        </div>

        {/* CTA */}
        <Button
          size="sm"
          disabled={course.progressPercent === 100}
          className="w-full gap-2 mt-1"
          onClick={() => router.push(`/courses/${course.id}/study`)}
        >
          <ActionIcon className="w-3.5 h-3.5" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EnrolledCoursesClientProps {
  courses: EnrolledCourse[];
}

export function EnrolledCoursesClient({ courses }: EnrolledCoursesClientProps) {
  const t = useTranslations("courses");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-background px-4 py-10 sm:px-8"
    >
      {/* Header */}
      <div className="mx-auto max-w-5xl mb-8">
        <div
          className={cn(
            "flex items-start justify-between gap-4 flex-wrap",
            isRtl && "flex-row-reverse"
          )}
        >
          <div>
            <div
              className={cn(
                "flex items-center gap-2 text-primary mb-1",
                
              )}
            >
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
          </div>

          {courses.length > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1 self-start mt-1">
              {courses.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Grid / Empty */}
      <div className="mx-auto max-w-5xl">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-28 text-muted-foreground">
            <BookOpen className="w-14 h-14 opacity-20" />
            <p className="text-sm">{t("empty")}</p>
            <Button variant="outline" onClick={() => router.push("/courses")}>
              {t("browseAll")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}