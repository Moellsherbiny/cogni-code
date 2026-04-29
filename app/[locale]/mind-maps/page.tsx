"use client";

import { useState, useTransition } from "react";
import { generateSummaryAction } from "@/actions/summarize";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import HistoryPanel from "@/components/mind-map/historyPanel";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Sun,
  Moon,
  Languages,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";

export default function SummarizePage() {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const t = useTranslations("summarize");
  const tResult = useTranslations("result");
  const locale = useLocale();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isRTL = locale === "ar";
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isReady = text.trim().length > 10;

  const handleGenerate = () => {
    start(async () => {
      const id = await generateSummaryAction(text);
      router.push(`/${locale}/mind-maps/result/${id}`);
    });
  };

  const historyTranslations = {
    historyTitle: tResult("historyTitle"),
    historyEmpty: tResult("historyEmpty"),
    historyEmptyDesc: tResult("historyEmptyDesc"),
    clearAll: tResult("clearAll"),
    clearConfirm: tResult("clearConfirm"),
    clearConfirmDesc: tResult("clearConfirmDesc"),
    cancel: tResult("cancel"),
    confirm: tResult("confirm"),
    openResult: tResult("openResult"),
  };

  return (
    <TooltipProvider>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col"
      >
        {/* Top accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary/60 to-transparent" />
        {/* Main */}
        <Navbar />
        <main className="mx-auto w-full max-w-2xl md:max-w-7xl flex-1 px-6 py-20 md:py-24">
            <HistoryPanel locale={locale} isRTL={isRTL} />
          {/* Hero */}
          <div className="mb-10 space-y-3">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3" />
              {t("badge")}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("title")}
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("description")}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
            {/* Card Header */}
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {t("inputLabel")}
              </span>
              <div className="ms-auto flex items-center gap-3 text-xs text-muted-foreground/60">
                <span>{wordCount} {t("words")}</span>
                <span>·</span>
                <span>{charCount} {t("chars")}</span>
              </div>
            </div>

            {/* Textarea */}
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("placeholder")}
              className={cn(
                "min-h-65 resize-none rounded-none border-0 bg-transparent px-4 py-4",
                "text-sm leading-relaxed placeholder:text-muted-foreground/40",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                isRTL && "text-right"
              )}
              dir={isRTL ? "rtl" : "ltr"}
            />

            {/* Card Footer */}
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
              <p className="text-xs text-muted-foreground/50">
                {!isReady && text.length > 0
                  ? t("minLengthHint")
                  : isReady
                  ? t("readyHint")
                  : t("startHint")}
              </p>

              <Button
                onClick={handleGenerate}
                disabled={pending || !isReady}
                size="sm"
                className={cn(
                  "h-9 gap-2 px-4 text-sm font-medium transition-all",
                  isReady && !pending && "shadow-sm shadow-primary/20"
                )}
              >
                {pending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    {t("generate")}
                    <ArrowRight
                      className={cn(
                        "h-3.5 w-3.5",
                        isRTL && "rotate-180"
                      )}
                    />
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/40">
            {t("footerNote")}
          </p>
        </main>
      </div>
    </TooltipProvider>
  );
}