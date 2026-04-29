"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { generateSummaryAction } from "@/actions/summarize";

import Navbar from "@/components/layout/navbar";
import HistoryPanel from "@/components/mind-map/historyPanel";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { cn } from "@/lib/utils";

import {
  Sparkles,
  FileText,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function SummarizePage() {
  const router = useRouter();
  const locale = useLocale();

  const t = useTranslations("summarize");
  const tResult = useTranslations("result");

  const isRTL = locale === "ar";

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const trimmed = text.trim();

  const charCount = text.length;
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  const isReady = trimmed.length >= 10;

  // ─────────────────────────────────────────────
  // Generate
  // ─────────────────────────────────────────────

  function handleGenerate() {
    if (!isReady || pending) return;

    setError("");

    startTransition(async () => {
      try {
        const result =
          await generateSummaryAction(trimmed);

        if (!result?.success) {
          setError(
            result?.message ||
              "Something went wrong."
          );
          return;
        }

        router.push(
          `/${locale}/mind-maps/result/${result.id}`
        );
      } catch (err) {
        setError(
          "Unexpected error. Please try again."
        );
      }
    });
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground flex flex-col"
    >
      {/* top line */}
      <div className="h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />

      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20 md:py-24">
        <HistoryPanel
          locale={locale}
          isRTL={isRTL}
        />

        {/* Hero */}
        <section className="mb-10 space-y-3">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <Sparkles className="h-3 w-3" />
            {t("badge")}
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("description")}
          </p>
        </section>

        {/* Error */}
        {error && (
          <Alert className="mb-6 border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />

            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Card */}
        <section className="rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
            <FileText className="h-4 w-4 text-muted-foreground" />

            <span className="text-xs font-medium text-muted-foreground">
              {t("inputLabel")}
            </span>

            <div className="ms-auto flex items-center gap-3 text-xs text-muted-foreground/60">
              <span>
                {wordCount} {t("words")}
              </span>

              <span>·</span>

              <span>
                {charCount} {t("chars")}
              </span>
            </div>
          </div>

          {/* Textarea */}
          <Textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder={t("placeholder")}
            dir={isRTL ? "rtl" : "ltr"}
            className={cn(
              "min-h-80 resize-none border-0 rounded-none bg-transparent px-4 py-4",
              "text-sm leading-relaxed",
              "placeholder:text-muted-foreground/40",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              isRTL && "text-right"
            )}
          />

          {/* Footer */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t border-border/40 px-4 py-3">
            <p className="text-xs text-muted-foreground/50">
              {!trimmed
                ? t("startHint")
                : !isReady
                ? t("minLengthHint")
                : t("readyHint")}
            </p>

            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={
                pending || !isReady
              }
              className={cn(
                "h-9 gap-2 px-4 text-sm font-medium",
                isReady &&
                  !pending &&
                  "shadow-sm shadow-primary/20"
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
                      isRTL &&
                        "rotate-180"
                    )}
                  />
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          {t("footerNote")}
        </p>
      </main>
    </div>
  );
}