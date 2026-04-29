"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
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
  EyeOff,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import type {
  StudyCourseDetail,
  LessonWithProgress,
} from "@/actions/student/courses";
import LanguageSwitcher from "../layout/language-switcher";
import { ModeToggle } from "../layout/theme-toggle";

type StudyMode = "normal" | "blind";

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

// ─── Lesson type chip ─────────────────────────────────────────────────────────

function LessonTypeChip({ type }: { type: LessonWithProgress["type"] }) {
  const t = useTranslations("study");
  const map = {
    VIDEO: {
      icon: PlayCircle,
      label: t("videoLesson"),
      cls: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50 ring-1 ring-blue-200 dark:ring-blue-800/50",
    },
    TEXT: {
      icon: FileText,
      label: t("textLesson"),
      cls: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/50 ring-1 ring-violet-200 dark:ring-violet-800/50",
    },
    MATERIAL: {
      icon: Paperclip,
      label: t("materialLesson"),
      cls: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50 ring-1 ring-amber-200 dark:ring-amber-800/50",
    },
  } as const;

  const { icon: Icon, label, cls } = map[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full",
        cls,
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </span>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level, locked }: { level: string; locked?: boolean }) {
  const t = useTranslations("study");
  const map: Record<string, string> = {
    BEGINNER:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-800/50",
    INTERMEDIATE:
      "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:ring-yellow-800/50",
    ADVANCED:
      "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-800/50",
  };

  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide inline-flex items-center gap-1",
        locked
          ? "bg-muted/60 text-muted-foreground/40 ring-1 ring-border/40"
          : (map[level] ?? "bg-muted text-muted-foreground"),
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
      toggleLessonProgress(studentId, lesson.id, next, courseId),
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 max-w-3xl mx-auto w-full">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
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
            "gap-2 shrink-0 transition-all duration-200",
            lesson.completed
              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-700/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              : "shadow-sm",
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

      <Separator className="opacity-60" />

      {/* Video */}
      {lesson.type === "VIDEO" && lesson.videoUrl && (
        <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg ring-1 ring-black/10 dark:ring-white/5">
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
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed",
            "prose-headings:text-foreground prose-p:text-foreground/90",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-code:text-foreground prose-code:bg-muted prose-code:rounded prose-code:px-1",
            "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground",
          )}
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      {/* Material download */}
      {lesson.type === "MATERIAL" && lesson.materialUrl && (
        <a
          href={lesson.materialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium text-primary",
            "hover:underline transition-opacity hover:opacity-80",
          )}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {t("downloadMaterial")}
        </a>
      )}

      {/* No content fallback */}
      {!lesson.content && !lesson.videoUrl && !lesson.materialUrl && (
        <p className="text-muted-foreground text-sm italic">{t("noContent")}</p>
      )}

      {/* Transcript collapsible */}
      {lesson.transcript && (
        <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs px-2 text-muted-foreground hover:text-foreground"
            >
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
            <div
              className={cn(
                "mt-3 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap",
                "bg-muted/40 dark:bg-muted/20 border border-border/40",
                "text-muted-foreground",
              )}
            >
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
    <div className="flex flex-col items-center justify-center h-full gap-5 text-muted-foreground px-6 text-center">
      <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 p-5 ring-1 ring-border/40">
        <Lock className="w-8 h-8 opacity-30" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground">
          {t("moduleLockedTitle", { defaultValue: "Module locked" })}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
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
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(course.modules.map((m) => [m.id, true])),
  );

  const toggleModule = (id: string) =>
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col h-full bg-card/30 dark:bg-card/20">
      {/* Course header */}
      <div className="p-4 border-b border-border/50 shrink-0 space-y-3.5">
        {/* Teacher row */}
        <div
          className={cn(
            "flex items-center gap-2.5",
            isRtl ? "flex-row-reverse" : "flex-row",
          )}
        >
          <Avatar className="w-7 h-7 shrink-0 ring-2 ring-border/40">
            <AvatarImage src={course.teacherImage ?? undefined} />
            <AvatarFallback className="text-xs bg-muted font-medium">
              {course.teacherName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {course.teacherName}
          </span>
        </div>

        <p
          className={cn(
            "text-sm font-semibold text-foreground leading-snug line-clamp-2",
            isRtl ? "text-right" : "text-left",
          )}
        >
          {course.title}
        </p>

        <div className="space-y-1.5">
          <Progress
            value={course.progressPercent}
            className="h-1.5 bg-muted/60 dark:bg-muted/30"
          />
          <p
            className={cn(
              "text-[11px] text-muted-foreground",
              isRtl ? "text-right" : "text-left",
            )}
          >
            {t("progress", { percent: course.progressPercent })}
          </p>
        </div>
      </div>

      {/* Module list */}
      <ScrollArea className="flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="p-2 space-y-0.5">
          {course.modules.map((mod) => {
            const locked = isModuleLocked(mod.level, studentLevel);

            return (
              <Collapsible
                key={mod.id}
                open={openModules[mod.id]}
                onOpenChange={() => toggleModule(mod.id)}
              >
                <CollapsibleTrigger className="w-full group">
                  <div
                  dir={isRtl ? "rtl" : "ltr"}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg w-full",
                      "hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors",
                      isRtl
                        ? "flex-row text-right"
                        : "flex-row text-left",
                      locked && "opacity-50",
                    )}
                  >
                    {/* Left/Right content */}
                    <div
                      className={cn(
                        "flex flex-col gap-1 min-w-0",
                        isRtl ? "items-center" : "items-center",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1.5 min-w-0",
                          isRtl ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        {locked && (
                          <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-foreground truncate">
                          {mod.title}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1.5",
                          isRtl ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        <LevelBadge level={mod.level} locked={locked} />
                        {!locked && (
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {mod.completedLessons}/{mod.totalLessons}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <span className="text-muted-foreground/60 shrink-0 transition-transform duration-200">
                      {openModules[mod.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div
                    className={cn(
                      "mt-0.5 space-y-0.5",
                      isRtl ? "me-2" : "ms-2",
                    )}
                  >
                    {mod.lessons.map((lesson) => (
                      <Tooltip key={lesson.id} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => onSelectLesson(lesson, locked)}
                            disabled={locked}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs",
                              "transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isRtl
                                ? "flex-row text-center"
                                : "flex-row text-left",
                              locked
                                ? "opacity-40 cursor-not-allowed"
                                : activeLessonId === lesson.id
                                  ? "bg-primary/10 dark:bg-primary/15 text-primary font-semibold"
                                  : "hover:bg-muted/50 dark:hover:bg-muted/30 text-foreground/80 hover:text-foreground",
                            )}
                          >
                            <span className="shrink-0">
                              {locked ? (
                                <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                              ) : lesson.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                              )}
                            </span>
                            <span className="truncate leading-snug">
                              {lesson.title}
                            </span>
                          </button>
                        </TooltipTrigger>
                        {locked && (
                          <TooltipContent
                            side={isRtl ? "left" : "right"}
                            className="text-xs"
                          >
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
  studentLevel: string;
}

export function StudyClient({
  course,
  studentId,
  studentLevel,
}: StudyClientProps) {
  const t = useTranslations("study");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";

  const [mode, setMode] = useState<StudyMode>("normal");
  useEffect(() => {
    const savedMode = localStorage.getItem("study-mode") as StudyMode;
    if (savedMode) setMode(savedMode);
  }, []);

  const toggleMode = () => {
    const nextMode = mode === "normal" ? "blind" : "normal";
    setMode(nextMode);
    localStorage.setItem("study-mode", nextMode);
  };

  const [localCourse, setLocalCourse] = useState(course);

  const [activeLesson, setActiveLesson] = useState<LessonWithProgress | null>(
    () => {
      const firstModule = localCourse.modules[0];
      if (!firstModule) return null;
      const firstLocked = isModuleLocked(firstModule.level, studentLevel);
      return firstLocked ? null : (firstModule.lessons[0] ?? null);
    },
  );
  const [activeLessonLocked, setActiveLessonLocked] = useState<string | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggle = useCallback((lessonId: string, completed: boolean) => {
    setLocalCourse((prev) => {
      const modules = prev.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed } : l,
        ),
        completedLessons: mod.lessons.filter((l) =>
          l.id === lessonId ? completed : l.completed,
        ).length,
      }));
      const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
      const completedLessons = modules.reduce(
        (s, m) => s + m.completedLessons,
        0,
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
      prev?.id === lessonId ? { ...prev, completed } : prev,
    );
  }, []);

  const handleSelectLesson = useCallback(
    (lesson: LessonWithProgress, locked: boolean) => {
      if (locked) {
        const mod = localCourse.modules.find((m) =>
          m.lessons.some((l) => l.id === lesson.id),
        );
        setActiveLessonLocked(mod?.level ?? "ADVANCED");
        setActiveLesson(null);
      } else {
        setActiveLesson(lesson);
        setActiveLessonLocked(null);
      }
    },
    [localCourse.modules],
  );

  useEffect(() => {
    if (mode === "blind") {
      router.push(`/${locale}/courses/${course.id}/learn-accessible`);
    }
  }, [mode, router, locale, course.id]);

  // Sidebar toggle icon: accounts for RTL direction
  const SidebarToggleIcon = sidebarOpen
    ? isRtl
      ? PanelLeftOpen
      : PanelLeftClose
    : isRtl
      ? PanelLeftClose
      : PanelLeftOpen;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="flex flex-col h-screen bg-background overflow-hidden"
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 shrink-0",
          "border-b border-border/50",
          "bg-card/70 dark:bg-card/50 backdrop-blur-md",
          isRtl ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0",
          )}
          onClick={() => router.back()}
        >
          {isRtl ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{t("backToCourses")}</span>
        </Button>

        <Separator orientation="vertical"/>
        {/* Sidebar toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <SidebarToggleIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            {sidebarOpen
              ? t("hideSidebar", { defaultValue: "Hide sidebar" })
              : t("showSidebar", { defaultValue: "Show sidebar" })}
          </TooltipContent>
        </Tooltip>
              <LanguageSwitcher />
              <ModeToggle/>

        {/* Course title */}
        <span
          className={cn(
            "text-sm font-semibold text-foreground truncate flex-1 min-w-0",
            isRtl ? "text-right" : "text-left",
          )}
        >
          {localCourse.title}
        </span>

        {/* Progress (desktop) */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Progress
            value={localCourse.progressPercent}
            className="w-24 h-1.5 bg-muted/60 dark:bg-muted/30"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-8">
            {localCourse.progressPercent}%
          </span>
        </div>

        {/* Mode toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMode}
          className={cn(
            "shrink-0 gap-2 text-xs",
            "border-border/60 hover:bg-muted/60 dark:hover:bg-muted/30",
            "transition-all duration-200",
          )}
        >
          {mode === "normal" ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {mode === "normal" ? t("blindMode") : t("normalMode")}
          </span>
        </Button>
      </header>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
            "border-border/50",
            isRtl ? "border-l" : "border-r",
            sidebarOpen ? "w-72" : "w-0",
          )}
        >
          {/* Always render so collapsibles don't reset */}
          <div className="w-72 h-full">
            <Sidebar
              course={localCourse}
              activeLessonId={activeLesson?.id ?? null}
              onSelectLesson={handleSelectLesson}
              isRtl={isRtl}
              studentLevel={studentLevel}
            />
          </div>
        </div>

        {/* Lesson / locked / empty area */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            "bg-background dark:bg-background",
          )}
        >
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
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground select-none">
              <div className="rounded-2xl bg-muted/30 dark:bg-muted/20 p-5">
                <BookOpen className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-sm text-muted-foreground/60">
                {t("selectLesson")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
