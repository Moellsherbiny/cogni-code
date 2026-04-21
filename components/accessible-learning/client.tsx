"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTTS } from "@/hooks/use-tts";
import { useSTT } from "@/hooks/use-stt";
import { VoiceControlPanel } from "./voice-control-panel";
import { LessonNavigator } from "./lesson-navigator";
import { AIConversation } from "./ai-conversation";
import { AccessibleHeader } from "./accessible-header";
import { SpeedSettings } from "./speed-settings";
import {
  markLessonComplete,
  askGeminiAboutLesson,
  generateLessonSummary,
} from "@/actions/student/learning-accessible";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";

export type LessonWithProgress = {
  id: string;
  title: string;
  content: string | null;
  transcript: string | null;
  type: string;
  moduleTitle: string;
  order: number;
  progress: { completed: boolean }[];
};
type StudyMode = "normal" | "blind";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
};

type Props = {
  course: { id: string; title: string; description: string | null };
  allLessons: LessonWithProgress[];
  activeLesson: LessonWithProgress | null;
  userId: string;
  locale: string;
};

// Voice commands map (EN + AR)
const COMMANDS = {
  en: {
    read: ["read", "read lesson", "start reading", "play"],
    stop: ["stop", "pause", "silence"],
    next: ["next", "next lesson"],
    prev: ["previous", "go back", "back"],
    ask: ["ask", "question", "i have a question"],
    summary: ["summary", "summarize", "give me a summary"],
    complete: ["done", "complete", "mark complete", "finished"],
  },
  ar: {
    read: ["اقرأ", "اقرأ الدرس", "ابدأ القراءة", "شغّل"],
    stop: ["توقف", "إيقاف", "أوقف"],
    next: ["التالي", "الدرس التالي"],
    prev: ["السابق", "ارجع", "الدرس السابق"],
    ask: ["اسأل", "سؤال", "عندي سؤال", "لدي سؤال"],
    summary: ["ملخص", "لخّص", "أعطني ملخصاً"],
    complete: ["أكملت", "انتهيت", "اكتمل"],
  },
};

export function AccessibleLearningClient({
  course,
  allLessons,
  activeLesson: initialLesson,
  userId,
  locale,
}: Props) {
  const t = useTranslations("accessibleLearn");
  const router = useRouter();

  const [activeLesson, setActiveLesson] = useState(initialLesson);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAskMode, setIsAskMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<StudyMode>("normal");
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const savedMode = localStorage.getItem("study-mode") as StudyMode;
    if (savedMode) setMode(savedMode);
    setIsMounted(true);
  }, []);

  const toggleMode = () => {
    const nextMode = mode === "normal" ? "blind" : "normal";
    setMode(nextMode);
    localStorage.setItem("study-mode", nextMode);
  };

  if (!isMounted) return null;

  const tts = useTTS(locale);

  const handleVoiceCommand = useCallback(
    async (transcript: string) => {
      const lower = transcript.toLowerCase().trim();
      const cmds = locale === "ar" ? COMMANDS.ar : COMMANDS.en;

      // --- STOP ---
      if (cmds.stop.some((c) => lower.includes(c))) {
        tts.stop();
        tts.speak(t("voice.stopped"));
        return;
      }

      // --- SUMMARY ---
      if (cmds.summary.some((c) => lower.includes(c))) {
        if (!activeLesson) return;
        tts.speak(t("voice.generatingSummary"));
        setIsLoading(true);
        const content = activeLesson.content ?? activeLesson.transcript ?? "";
        const { summary } = await generateLessonSummary(
          content,
          activeLesson.title,
          locale,
        );
        setIsLoading(false);
        const msg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          text: summary,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, msg]);
        tts.speakLong(summary);
        return;
      }

      // --- NEXT ---
      if (cmds.next.some((c) => lower.includes(c))) {
        const idx = allLessons.findIndex((l) => l.id === activeLesson?.id);
        const next = allLessons[idx + 1];
        if (next) {
          tts.stop();
          tts.speak(
            locale === "ar"
              ? `الانتقال إلى: ${next.title}`
              : `Moving to: ${next.title}`,
          );
          setActiveLesson(next);
          setMessages([]);
          router.push(`?lessonId=${next.id}`, { scroll: false });
        } else {
          tts.speak(
            locale === "ar"
              ? "وصلت إلى نهاية الدورة."
              : "You have reached the end of the course.",
          );
        }
        return;
      }

      // --- PREV ---
      if (cmds.prev.some((c) => lower.includes(c))) {
        const idx = allLessons.findIndex((l) => l.id === activeLesson?.id);
        const prev = allLessons[idx - 1];
        if (prev) {
          tts.stop();
          tts.speak(
            locale === "ar"
              ? `الرجوع إلى: ${prev.title}`
              : `Going back to: ${prev.title}`,
          );
          setActiveLesson(prev);
          setMessages([]);
          router.push(`?lessonId=${prev.id}`, { scroll: false });
        } else {
          tts.speak(
            locale === "ar"
              ? "هذا هو الدرس الأول."
              : "This is the first lesson.",
          );
        }
        return;
      }

      // --- COMPLETE ---
      if (cmds.complete.some((c) => lower.includes(c))) {
        if (!activeLesson) return;
        await markLessonComplete(activeLesson.id, course.id);
        tts.speak(
          locale === "ar"
            ? "تم تحديد الدرس كمكتمل."
            : "Lesson marked as complete.",
        );
        return;
      }

      // --- READ ---
      if (cmds.read.some((c) => lower.includes(c))) {
        if (!activeLesson) return;
        const content = activeLesson.content ?? activeLesson.transcript ?? "";
        if (content) {
          const intro =
            locale === "ar"
              ? `درس: ${activeLesson.title}. `
              : `Lesson: ${activeLesson.title}. `;
          tts.speakLong(intro + content);
        } else {
          tts.speak(
            locale === "ar"
              ? "لا يوجد محتوى نصي لهذا الدرس."
              : "No text content available for this lesson.",
          );
        }
        return;
      }

      // --- ASK mode or free question ---
      if (cmds.ask.some((c) => lower.includes(c)) || isAskMode) {
        setIsAskMode(false);
        if (!activeLesson) return;

        const question = cmds.ask.some((c) => lower.includes(c))
          ? transcript
              .replace(/ask|question|اسأل|سؤال|عندي سؤال|لدي سؤال/gi, "")
              .trim()
          : transcript;

        if (!question) {
          tts.speak(locale === "ar" ? "ما سؤالك؟" : "What is your question?");
          setIsAskMode(true);
          return;
        }

        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          text: question,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        tts.speak(
          locale === "ar"
            ? "جاري معالجة سؤالك..."
            : "Processing your question...",
        );
        setIsLoading(true);

        const content = activeLesson.content ?? activeLesson.transcript ?? "";
        const { answer } = await askGeminiAboutLesson(
          content,
          activeLesson.title,
          question,
          locale,
        );
        setIsLoading(false);

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        tts.speakLong(answer);
        return;
      }

      // Unrecognized — treat as a question
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: transcript,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      if (activeLesson) {
        tts.speak(locale === "ar" ? "جاري البحث..." : "Looking that up...");
        setIsLoading(true);
        const content = activeLesson.content ?? activeLesson.transcript ?? "";
        const { answer } = await askGeminiAboutLesson(
          content,
          activeLesson.title,
          transcript,
          locale,
        );
        setIsLoading(false);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        tts.speakLong(answer);
      }
    },
    [activeLesson, allLessons, course.id, isAskMode, locale, router, t, tts],
  );

  const stt = useSTT({
    locale,
    onResult: handleVoiceCommand,
    onError: (err) => {
      tts.speak(
        locale === "ar"
          ? "لم أستطع سماعك، يرجى المحاولة مرة أخرى."
          : "I couldn't hear you, please try again.",
      );
    },
  });

  // Welcome message on mount
  useEffect(() => {
    if (activeLesson) {
      const welcome =
        locale === "ar"
          ? `مرحباً بك في وضع التعلم المُيسَّر. الدرس الحالي: ${activeLesson.title}. قل "اقرأ" للاستماع إلى الدرس، أو "سؤال" لطرح سؤال.`
          : `Welcome to accessible learning mode. Current lesson: ${activeLesson.title}. Say "read" to listen to the lesson, or "ask" to ask a question.`;
      const timer = setTimeout(() => tts.speak(welcome), 800);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLessonSelect = (lesson: LessonWithProgress) => {
    tts.stop();
    setActiveLesson(lesson);
    setMessages([]);
    router.push(`?lessonId=${lesson.id}`, { scroll: false });
    tts.speak(
      locale === "ar"
        ? `الانتقال إلى: ${lesson.title}`
        : `Switching to: ${lesson.title}`,
    );
  };

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <AccessibleHeader
        courseTitle={course.title}
        lessonTitle={activeLesson?.title ?? ""}
        ttsStatus={tts.status}
        onToggleSettings={() => setShowSettings((v) => !v)}
        locale={locale}
      />
<Button
          variant="outline"
          size="sm"
          onClick={toggleMode}
          className="ml-auto flex gap-2"
        >
          {mode === "normal" ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {mode === "normal" ? t("blindMode") : t("normalMode")}
        </Button>
      <div className="flex flex-1 overflow-hidden">
        {/* Lesson Sidebar */}
        <LessonNavigator
          lessons={allLessons}
          activeLesson={activeLesson}
          onSelect={handleLessonSelect}
          locale={locale}
        />

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Speed Settings panel */}
          {showSettings && (
            <SpeedSettings
              rate={tts.rate}
              pitch={tts.pitch}
              onRateChange={tts.setRate}
              onPitchChange={tts.setPitch}
              locale={locale}
            />
          )}

          {/* Conversation area */}
          <AIConversation
            messages={messages}
            isLoading={isLoading}
            activeLesson={activeLesson}
            locale={locale}
            onSpeak={(text) => tts.speakLong(text)}
          />

          {/* Voice Control */}
          <VoiceControlPanel
            tts={tts}
            stt={stt}
            activeLesson={activeLesson}
            isLoading={isLoading}
            locale={locale}
            courseId={course.id}
          />
        </main>
      </div>
    </div>
  );
}
