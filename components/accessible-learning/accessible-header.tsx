"use client";

import { useTranslations } from "next-intl";
import { Volume2, VolumeX, Settings, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TTSStatus } from "@/hooks/use-tts";

type Props = {
  courseTitle: string;
  lessonTitle: string;
  ttsStatus: TTSStatus;
  onToggleSettings: () => void;
  locale: string;
};

export function AccessibleHeader({
  courseTitle,
  lessonTitle,
  ttsStatus,
  onToggleSettings,
  locale,
}: Props) {
  const t = useTranslations("accessibleLearn");
  const isRTL = locale === "ar";

  return (
    <header
      className="sticky top-0 z-20 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3"
      role="banner"
      aria-label={t("header.ariaLabel")}
    >
      <div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto">
        {/* Back */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-neutral-400 hover:text-neutral-100 shrink-0"
            aria-label={t("header.backToCourse")}
          >
            <Link href={`/courses/${courseTitle}`}>
              <ArrowLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
            </Link>
          </Button>

          <div className="min-w-0">
            <p className="text-xs text-neutral-500 truncate">{courseTitle}</p>
            <h1 className="text-sm font-semibold text-neutral-100 truncate">
              {lessonTitle}
            </h1>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* TTS status badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-xs border font-medium hidden sm:flex items-center gap-1.5",
              ttsStatus === "speaking"
                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                : ttsStatus === "paused"
                ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                : "border-neutral-700 text-neutral-500"
            )}
            aria-live="polite"
            aria-label={t("header.ttsStatus", { status: ttsStatus })}
          >
            {ttsStatus === "speaking" ? (
              <Volume2 className="w-3 h-3 animate-pulse" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
            {t(`header.tts.${ttsStatus}`)}
          </Badge>

          {/* Accessible mode badge */}
          <Badge className="bg-indigo-600 text-white border-0 text-xs hidden sm:flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {t("header.accessibleMode")}
          </Badge>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSettings}
            className="text-neutral-400 hover:text-neutral-100"
            aria-label={t("header.settings")}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}