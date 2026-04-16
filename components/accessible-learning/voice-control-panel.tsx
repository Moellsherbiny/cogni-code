"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  SkipForward,
  CheckCheck,
  BookOpen,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { markLessonComplete, generateLessonSummary } from "@/actions/student/learning-accessible";
import type { LessonWithProgress } from "./client";
import type { TTSStatus } from "@/hooks/use-tts";
import type { STTStatus } from "@/hooks/use-stt";

type Props = {
  tts: {
    speak: (text: string) => void;
    speakLong: (text: string) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    status: TTSStatus;
    isSupported: boolean;
  };
  stt: {
    start: () => void;
    stop: () => void;
    status: STTStatus;
    isSupported: boolean;
  };
  activeLesson: LessonWithProgress | null;
  isLoading: boolean;
  locale: string;
  courseId: string;
};

const STATUS_RINGS = {
  idle: "ring-neutral-700",
  listening: "ring-rose-500 ring-4 animate-pulse",
  processing: "ring-amber-500 ring-4",
  error: "ring-red-600 ring-4",
};

export function VoiceControlPanel({
  tts,
  stt,
  activeLesson,
  isLoading,
  locale,
  courseId,
}: Props) {
  const t = useTranslations("accessibleLearn");
  const [marking, setMarking] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const handleReadLesson = useCallback(() => {
    if (!activeLesson) return;
    const content = activeLesson.content ?? activeLesson.transcript ?? "";
    if (!content) {
      tts.speak(
        locale === "ar"
          ? "لا يوجد محتوى نصي."
          : "No text content available."
      );
      return;
    }
    const intro =
      locale === "ar"
        ? `درس: ${activeLesson.title}. `
        : `Lesson: ${activeLesson.title}. `;
    tts.speakLong(intro + content);
  }, [activeLesson, locale, tts]);

  const handleMarkComplete = useCallback(async () => {
    if (!activeLesson) return;
    setMarking(true);
    await markLessonComplete(activeLesson.id, courseId);
    setMarking(false);
    tts.speak(
      locale === "ar"
        ? "تم تحديد الدرس كمكتمل."
        : "Lesson marked as complete."
    );
  }, [activeLesson, courseId, locale, tts]);

  const handleSummary = useCallback(async () => {
    if (!activeLesson) return;
    setSummarizing(true);
    tts.speak(
      locale === "ar" ? "جاري إنشاء الملخص..." : "Generating summary..."
    );
    const content = activeLesson.content ?? activeLesson.transcript ?? "";
    const { summary } = await generateLessonSummary(
      content,
      activeLesson.title,
      locale
    );
    setSummarizing(false);
    tts.speakLong(summary);
  }, [activeLesson, locale, tts]);

  const micStatusLabel = {
    idle: t("controls.micIdle"),
    listening: t("controls.micListening"),
    processing: t("controls.micProcessing"),
    error: t("controls.micError"),
  }[stt.status];

  return (
    <div
      className="border-t border-neutral-800 bg-neutral-950 px-4 py-4 md:py-5"
      role="toolbar"
      aria-label={t("controls.ariaLabel")}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Mic status text */}
        <div
          className="text-center text-xs text-neutral-500 h-4"
          aria-live="polite"
          aria-atomic="true"
        >
          {stt.status !== "idle" && micStatusLabel}
        </div>

        {/* Primary MIC button */}
        <div className="flex justify-center">
          <Button
            onClick={stt.status === "listening" ? stt.stop : stt.start}
            disabled={!stt.isSupported || isLoading}
            aria-label={
              stt.status === "listening"
                ? t("controls.stopListening")
                : t("controls.startListening")
            }
            aria-pressed={stt.status === "listening"}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-neutral-900 border-2 ring-2 ring-offset-2 ring-offset-neutral-950",
              "focus-visible:outline-none focus-visible:ring-indigo-500",
              STATUS_RINGS[stt.status],
              stt.status === "listening"
                ? "border-rose-500 bg-rose-950"
                : "border-neutral-700 hover:border-indigo-500 hover:bg-indigo-950",
              (!stt.isSupported || isLoading) && "opacity-40 cursor-not-allowed"
            )}
          >
            {stt.status === "processing" ? (
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            ) : stt.status === "listening" ? (
              <MicOff className="w-8 h-8 text-rose-400" />
            ) : (
              <Mic className="w-8 h-8 text-indigo-400" />
            )}
          </Button>
        </div>

        {/* TTS controls row */}
        <div
          className="flex items-center justify-center gap-2 flex-wrap"
          role="group"
          aria-label={t("controls.ttsControls")}
        >
          {/* Read lesson */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReadLesson}
            disabled={!activeLesson || !tts.isSupported}
            aria-label={t("controls.readLesson")}
            className="gap-1.5 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t("controls.readLesson")}
          </Button>

          {/* Pause / Resume */}
          {tts.status === "speaking" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={tts.pause}
              aria-label={t("controls.pause")}
              className="gap-1.5 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs"
            >
              <Pause className="w-3.5 h-3.5" />
              {t("controls.pause")}
            </Button>
          ) : tts.status === "paused" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={tts.resume}
              aria-label={t("controls.resume")}
              className="gap-1.5 border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              {t("controls.resume")}
            </Button>
          ) : null}

          {/* Stop */}
          <Button
            variant="outline"
            size="sm"
            onClick={tts.stop}
            disabled={tts.status === "idle"}
            aria-label={t("controls.stop")}
            className="gap-1.5 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs disabled:opacity-30"
          >
            <Square className="w-3.5 h-3.5" />
            {t("controls.stop")}
          </Button>

          {/* Summary */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSummary}
            disabled={!activeLesson || summarizing || isLoading}
            aria-label={t("controls.summary")}
            className="gap-1.5 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs"
          >
            {summarizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            {t("controls.summary")}
          </Button>

          {/* Mark complete */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkComplete}
            disabled={!activeLesson || marking}
            aria-label={t("controls.markComplete")}
            className="gap-1.5 border-emerald-700/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 text-xs"
          >
            {marking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            {t("controls.markComplete")}
          </Button>
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-center text-[11px] text-neutral-700 hidden md:block">
          {t("controls.hint")}
        </p>
      </div>
    </div>
  );
}