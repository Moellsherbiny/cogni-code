"use client";

import React, { useState, useTransition, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  AlignLeft,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleLessonProgress } from "@/actions/student/courses";
import type { StudyCourseDetail, LessonWithProgress } from "@/actions/student/courses";

// ─── Level hierarchy ──────────────────────────────────────────────────────────

const LEVEL_ORDER: Record<string, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
};

function isModuleLocked(moduleLevel: string, studentLevel: string): boolean {
  return (LEVEL_ORDER[moduleLevel] ?? 0) > (LEVEL_ORDER[studentLevel] ?? 0);
}

function getVideoId(url: string) {
  const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// ─── Lesson type icon / label ─────────────────────────────────────────────────

function LessonTypeChip({ type }: { type: LessonWithProgress["type"] }) {
  const t = useTranslations("study");
  const map = {
    VIDEO: {
      icon: PlayCircle,
      label: t("videoLesson"),
      cls: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    },
    TEXT: {
      icon: FileText,
      label: t("textLesson"),
      cls: "text-violet-500 bg-violet-50 dark:bg-violet-950/40",
    },
    MATERIAL: {
      icon: Paperclip,
      label: t("materialLesson"),
      cls: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    },
  } as const;

  const { icon: Icon, label, cls } = map[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
        cls
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level, locked }: { level: string; locked?: boolean }) {
  const t = useTranslations("study");
  const map: Record<string, string> = {
    BEGINNER:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    ADVANCED:     "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center gap-1",
        locked
          ? "bg-muted text-muted-foreground/60"
          : (map[level] ?? "bg-muted text-muted-foreground")
      )}
    >
      {locked && <Lock className="w-2.5 h-2.5" />}
      {t(`levels.${level}` as any, { defaultValue: level })}
    </span>
  );
}

// ─── Lesson viewer ────────────────────────────────────────────────────────────

function LessonViewer({
  lesson,
  courseId,
  studentId,
  onToggle,
}: {
  lesson: LessonWithProgress;
  courseId: string;
  studentId: string;
  onToggle: (lessonId: string, completed: boolean) => void;
}) {
  const t = useTranslations("study");
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !lesson.completed;
    onToggle(lesson.id, next);
    startTransition(() =>
      toggleLessonProgress(studentId, lesson.id, next, courseId)
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 max-w-3xl mx-auto w-full">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <LessonTypeChip type={lesson.type} />
          <h2 className="text-xl font-bold text-foreground leading-snug">
            {lesson.title}
          </h2>
        </div>

        <Button
          size="sm"
          variant={lesson.completed ? "outline" : "default"}
          disabled={isPending}
          onClick={handleToggle}
          className={cn(
            "gap-2 shrink-0",
            lesson.completed &&
              "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400"
          )}
        >
          {lesson.completed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          {lesson.completed ? t("markIncomplete") : t("markComplete")}
        </Button>
      </div>

      <Separator />

      {/* Video */}
      {lesson.type === "VIDEO" && lesson.videoUrl && (
        <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-md">
          <iframe
            src={`https://www.youtube.com/embed/${getVideoId(lesson.videoUrl)}`}
            title={lesson.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            
          />
        </div>
      )}

      {/* Text content */}
      {lesson.content && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {/* Material download */}
      {lesson.type === "MATERIAL" && lesson.materialUrl && (
        <a
          href={lesson.materialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          {t("downloadMaterial")}
        </a>
      )}

      {/* No content fallback */}
      {!lesson.content && !lesson.videoUrl && !lesson.materialUrl && (
        <p className="text-muted-foreground text-sm">{t("noContent")}</p>
      )}

      {/* Transcript collapsible */}
      {lesson.transcript && (
        <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-xs px-2">
              <AlignLeft className="w-3.5 h-3.5" />
              {t("transcript")}
              {showTranscript ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border border-border/50">
              {lesson.transcript}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ─── Locked module placeholder ────────────────────────────────────────────────

function LockedModulePlaceholder({ moduleLevel }: { moduleLevel: string }) {
  const t = useTranslations("study");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground px-6 text-center">
      <div className="rounded-full bg-muted p-4">
        <Lock className="w-8 h-8 opacity-40" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {t("moduleLockedTitle", { defaultValue: "Module locked" })}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {t("moduleLockedDesc", {
            level: moduleLevel,
            defaultValue: `This module requires ${moduleLevel} level or above.`,
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  course,
  activeLessonId,
  onSelectLesson,
  isRtl,
  studentLevel,
}: {
  course: StudyCourseDetail;
  activeLessonId: string | null;
  onSelectLesson: (lesson: LessonWithProgress, locked: boolean) => void;
  isRtl: boolean;
  studentLevel: string;
}) {
  const t = useTranslations("study");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    () => Object.fromEntries(course.modules.map((m) => [m.id, true]))
  );

  const toggleModule = (id: string) =>
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col h-full border-e border-border/60 bg-card/50">
      {/* Course header */}
      <div className="p-4 border-b border-border/50 shrink-0 space-y-3">
        <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage src={course.teacherImage ?? undefined} />
            <AvatarFallback className="text-xs">
              {course.teacherName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {course.teacherName}
          </span>
        </div>

        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {course.title}
        </p>

        <div className="space-y-1">
          <Progress value={course.progressPercent} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground">
            {t("progress", { percent: course.progressPercent })}
          </p>
        </div>
      </div>

      {/* Module list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {course.modules.map((mod) => {
            const locked = isModuleLocked(mod.level, studentLevel);

            return (
              <Collapsible
                key={mod.id}
                open={openModules[mod.id]}
                onOpenChange={() => toggleModule(mod.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg",
                      "hover:bg-muted/60 transition-colors text-start w-full",
                      locked && "opacity-60",
                      isRtl && "flex-row-reverse"
                    )}
                  >
                    <div className={cn("flex flex-col gap-0.5 min-w-0", isRtl && "items-end")}>
                      <div className={cn("flex items-center gap-1.5", isRtl && "flex-row-reverse")}>
                        {locked && (
                          <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-foreground truncate">
                          {mod.title}
                        </span>
                      </div>
                      <div className={cn("flex items-center gap-1.5", isRtl && "flex-row-reverse")}>
                        <LevelBadge level={mod.level} locked={locked} />
                        {!locked && (
                          <span className="text-[10px] text-muted-foreground">
                            {mod.completedLessons}/{mod.totalLessons}
                          </span>
                        )}
                      </div>
                    </div>
                    {openModules[mod.id] ? (
                      <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ms-2 mt-0.5 space-y-0.5">
                    {mod.lessons.map((lesson) => (
                      <Tooltip key={lesson.id} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => onSelectLesson(lesson, locked)}
                            disabled={locked}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-start",
                              "transition-colors text-sm",
                              isRtl && "flex-row-reverse",
                              locked
                                ? "opacity-50 cursor-not-allowed"
                                : activeLessonId === lesson.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted/60 text-foreground"
                            )}
                          >
                            {locked ? (
                              <Lock className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                            ) : lesson.completed ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                            )}
                            <span className="truncate text-xs leading-snug">
                              {lesson.title}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        {locked && (
                          <TooltipContent side="right" className="text-xs">
                            {t("requiresLevel", {
                              level: mod.level,
                              defaultValue: `Requires ${mod.level} level`,
                            })}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface StudyClientProps {
  course: StudyCourseDetail;
  studentId: string;
  studentLevel: string; // "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
}

export function StudyClient({ course, studentId, studentLevel }: StudyClientProps) {
  const t = useTranslations("study");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";

  // Optimistic local state for progress
  const [localCourse, setLocalCourse] = useState(course);

  // Track active lesson + whether it's from a locked module
  const [activeLesson, setActiveLesson] = useState<LessonWithProgress | null>(
    () => {
      const firstModule = localCourse.modules[0];
      if (!firstModule) return null;
      const firstLocked = isModuleLocked(firstModule.level, studentLevel);
      return firstLocked ? null : (firstModule.lessons[0] ?? null);
    }
  );
  const [activeLessonLocked, setActiveLessonLocked] = useState<string | null>(null); // holds moduleLevel when locked
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggle = useCallback(
    (lessonId: string, completed: boolean) => {
      setLocalCourse((prev) => {
        const modules = prev.modules.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === lessonId ? { ...l, completed } : l
          ),
          completedLessons: mod.lessons.filter((l) =>
            l.id === lessonId ? completed : l.completed
          ).length,
        }));
        const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
        const completedLessons = modules.reduce(
          (s, m) => s + m.completedLessons,
          0
        );
        return {
          ...prev,
          modules,
          completedLessons,
          progressPercent:
            totalLessons === 0
              ? 0
              : Math.round((completedLessons / totalLessons) * 100),
        };
      });
      setActiveLesson((prev) =>
        prev?.id === lessonId ? { ...prev, completed } : prev
      );
    },
    []
  );

  const handleSelectLesson = useCallback(
    (lesson: LessonWithProgress, locked: boolean) => {
      if (locked) {
        // Show the locked state in the main panel, find the module level
        const mod = localCourse.modules.find((m) =>
          m.lessons.some((l) => l.id === lesson.id)
        );
        setActiveLessonLocked(mod?.level ?? "ADVANCED");
        setActiveLesson(null);
      } else {
        setActiveLesson(lesson);
        setActiveLessonLocked(null);
      }
    },
    [localCourse.modules]
  );

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="flex flex-col h-screen bg-background overflow-hidden"
    >
      {/* Top bar */}
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 border-b border-border/60 bg-card/80 backdrop-blur-sm shrink-0",
          isRtl && "flex-row-reverse"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => router.push("/courses")}
        >
          {isRtl ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          {t("backToCourses")}
        </Button>

        <Separator orientation="vertical" className="h-4" />

        <span className="text-sm font-semibold text-foreground truncate flex-1">
          {localCourse.title}
        </span>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Progress
            value={localCourse.progressPercent}
            className="w-24 h-1.5"
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {localCourse.progressPercent}%
          </span>
        </div>

        {/* Sidebar toggle (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:hidden"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <BookOpen className="w-4 h-4" />
        </Button>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "w-72 shrink-0 transition-all duration-300 overflow-hidden",
            sidebarOpen ? "w-72" : "w-0"
          )}
        >
          <Sidebar
            course={localCourse}
            activeLessonId={activeLesson?.id ?? null}
            onSelectLesson={handleSelectLesson}
            isRtl={isRtl}
            studentLevel={studentLevel}
          />
        </div>

        {/* Lesson / locked area */}
        <main className="flex-1 overflow-auto">
          {activeLessonLocked ? (
            <LockedModulePlaceholder moduleLevel={activeLessonLocked} />
          ) : activeLesson ? (
            <LessonViewer
              lesson={activeLesson}
              courseId={course.id}
              studentId={studentId}
              onToggle={handleToggle}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p className="text-sm">{t("selectLesson")}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}