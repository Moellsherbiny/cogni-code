"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Bot, User, Volume2, Loader2, BookOpen, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LessonWithProgress } from "./client";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
};

type Props = {
  messages: Message[];
  isLoading: boolean;
  activeLesson: LessonWithProgress | null;
  locale: string;
  onSpeak: (text: string) => void;
};

export function AIConversation({
  messages,
  isLoading,
  activeLesson,
  locale,
  onSpeak,
}: Props) {
  const t = useTranslations("accessibleLearn");
  const bottomRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const commands =
    locale === "ar"
      ? [
          { cmd: '"اقرأ"', desc: "لاستماع الدرس" },
          { cmd: '"سؤال"', desc: "لطرح سؤال" },
          { cmd: '"ملخص"', desc: "للحصول على ملخص" },
          { cmd: '"التالي"', desc: "للانتقال للدرس التالي" },
          { cmd: '"أكملت"', desc: "لتحديد الدرس كمكتمل" },
        ]
      : [
          { cmd: '"read"', desc: "to listen to the lesson" },
          { cmd: '"ask"', desc: "to ask a question" },
          { cmd: '"summary"', desc: "to get a summary" },
          { cmd: '"next"', desc: "to go to the next lesson" },
          { cmd: '"done"', desc: "to mark lesson complete" },
        ];

  return (
    <div
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      role="log"
      aria-live="polite"
      aria-label={t("conversation.ariaLabel")}
    >
      {/* Empty state — command guide */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-8">
          {/* Lesson card */}
          {activeLesson && (
            <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {t("conversation.currentLesson")}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-100">
                {activeLesson.title}
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                {activeLesson.content?.slice(0, 200) ?? t("conversation.noPreview")}
              </p>
            </div>
          )}

          {/* Commands grid */}
          <div className="max-w-lg w-full">
            <div className="flex items-center gap-2 text-neutral-500 mb-4 justify-center">
              <Mic className="w-4 h-4" />
              <span className="text-sm">{t("conversation.voiceCommands")}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commands.map(({ cmd, desc }) => (
                <div
                  key={cmd}
                  className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-start"
                >
                  <span className="font-mono text-indigo-300 font-bold text-sm shrink-0">
                    {cmd}
                  </span>
                  <span className="text-neutral-500 text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex gap-3 max-w-2xl",
            msg.role === "user" ? (isRTL ? "ms-auto flex-row-reverse" : "ms-auto flex-row-reverse") : ""
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
              msg.role === "assistant"
                ? "bg-indigo-600"
                : "bg-neutral-700"
            )}
            aria-hidden="true"
          >
            {msg.role === "assistant" ? (
              <Bot className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-neutral-300" />
            )}
          </div>

          {/* Bubble */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 max-w-prose space-y-2",
              msg.role === "assistant"
                ? "bg-neutral-900 border border-neutral-800 text-neutral-100"
                : "bg-indigo-600 text-white"
            )}
          >
            <p className="text-sm leading-relaxed" tabIndex={0}>
              {msg.text}
            </p>

            {/* Replay button for AI messages */}
            {msg.role === "assistant" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSpeak(msg.text)}
                className="h-7 px-2 text-xs text-neutral-500 hover:text-indigo-400 gap-1 -ms-1"
                aria-label={t("conversation.replay")}
              >
                <Volume2 className="w-3 h-3" />
                {t("conversation.replay")}
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Loading */}
      {isLoading && (
        <div className="flex gap-3 max-w-2xl" aria-live="polite">
          <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="text-sm text-neutral-500">
              {t("conversation.thinking")}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}