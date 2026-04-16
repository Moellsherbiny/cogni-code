"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonWithProgress } from "./client";

type Props = {
  lessons: LessonWithProgress[];
  activeLesson: LessonWithProgress | null;
  onSelect: (lesson: LessonWithProgress) => void;
  locale: string;
};

export function LessonNavigator({
  lessons,
  activeLesson,
  onSelect,
  locale,
}: Props) {
  const t = useTranslations("accessibleLearn");
  const isRTL = locale === "ar";

  // Group by module
  const grouped = lessons.reduce<Record<string, LessonWithProgress[]>>(
    (acc, lesson) => {
      const key = lesson.moduleTitle;
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson);
      return acc;
    },
    {}
  );

  const completedCount = lessons.filter((l) => l.progress[0]?.completed).length;

  return (
    <nav
      className="hidden md:flex flex-col w-72 border-e border-neutral-800 bg-neutral-900 overflow-y-auto"
      aria-label={t("nav.ariaLabel")}
    >
      {/* Progress summary */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            {t("nav.lessons")}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{t("nav.completed", { count: completedCount, total: lessons.length })}</span>
          <span className="text-indigo-400 font-medium">
            {Math.round((completedCount / lessons.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / lessons.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(grouped).map(([moduleTitle, moduleLessons]) => (
          <div key={moduleTitle} className="mb-1">
            <div className="px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-600">
                {moduleTitle}
              </p>
            </div>
            {moduleLessons.map((lesson) => {
              const isActive = lesson.id === activeLesson?.id;
              const isDone = lesson.progress[0]?.completed;

              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelect(lesson)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${lesson.title}${isDone ? ` — ${t("nav.done")}` : ""}`}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-start transition-all duration-150",
                    "hover:bg-neutral-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset",
                    isActive
                      ? "bg-indigo-600/20 border-e-2 border-e-indigo-500"
                      : "border-e-2 border-e-transparent"
                  )}
                >
                  <span className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-indigo-400" : "text-neutral-600"
                        )}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-snug flex-1 min-w-0 truncate",
                      isActive
                        ? "text-indigo-300 font-medium"
                        : isDone
                        ? "text-neutral-400"
                        : "text-neutral-300"
                    )}
                  >
                    {lesson.title}
                  </span>
                  {isActive && (
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 text-indigo-400 shrink-0",
                        isRTL && "rotate-180"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}