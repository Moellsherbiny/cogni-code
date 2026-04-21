"use client";

import { useEffect, useState, useTransition } from "react";
import { getHistoryAction } from "@/actions/summarize";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  History,
  Trash2,
  Clock,
  ExternalLink,
  BookOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Matches what getHistoryAction() returns (MindMapHistory rows)
interface HistoryRow {
  id: string;
  summary: string;
  createdAt: Date;
}

interface Props {
  locale: string;
  isRTL: boolean;
}

function extractTitle(summary: string): string {
  const first = summary.split("\n").find((l) => l.trim().length > 0) ?? "";
  return first.replace(/^#+\s*/, "").slice(0, 70) || "Summary";
}

function timeAgo(date: Date, locale: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const isAr = locale === "ar";
  if (mins < 1) return isAr ? "الآن" : "just now";
  if (mins < 60) return isAr ? `منذ ${mins} د` : `${mins}m ago`;
  if (hours < 24) return isAr ? `منذ ${hours} س` : `${hours}h ago`;
  return isAr ? `منذ ${days} ي` : `${days}d ago`;
}

export default function HistoryPanel({ locale, isRTL }: Props) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearPending, startClear] = useTransition();
    const tr = useTranslations("result");
  // Fetch from DB whenever the sheet opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getHistoryAction()
      .then((rows) => setEntries(rows as HistoryRow[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  // Optimistic local remove (no extra server action needed for now)
  const handleRemove = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  // Optimistic clear — add a clearAllHistoryAction() call here if you need it persisted
  const handleClearAll = () => {
    startClear(async () => {
      setEntries([]);
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <History className="h-3.5 w-3.5" />
              {tr("historyTitle")}
          {entries.length > 0 && (
            <span className="absolute -top-0.5 -inset-e-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {entries.length > 9 ? "9+" : entries.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side={isRTL ? "right" : "left"}
        className="flex w-80 flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4 text-primary" />
              {tr("historyTitle")}
            </SheetTitle>

            {entries.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                    disabled={clearPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tr("clearConfirm")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {tr("clearConfirmDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tr("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {tr("confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {tr("historyEmpty")}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {tr("historyEmptyDesc")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {entries.map((entry) => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  locale={locale}
                  isRTL={isRTL}
                  onRemove={() => handleRemove(entry.id)}
                  openLabel={tr("openResult")}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer count */}
        {!loading && entries.length > 0 && (
          <div className="border-t border-border/40 px-4 py-2.5">
            <p className="text-center text-xs text-muted-foreground/50">
              {entries.length}{" "}
              {locale === "ar" ? "ملخص محفوظ" : "saved summaries"}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function HistoryItem({
  entry,
  locale,
  isRTL,
  onRemove,
  openLabel,
}: {
  entry: HistoryRow;
  locale: string;
  isRTL: boolean;
  onRemove: () => void;
  openLabel: string;
}) {
  return (
    <div className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
      {/* Icon */}
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/15">
        <BookOpen className="h-3.5 w-3.5 text-primary/70" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p
          className={cn(
            "line-clamp-2 text-xs font-medium leading-relaxed text-foreground",
            isRTL && "text-right"
          )}
        >
          {extractTitle(entry.summary)}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <Clock className="h-2.5 w-2.5" />
          <span>{timeAgo(entry.createdAt, locale)}</span>
        </div>
      </div>

      {/* Actions (on hover) */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Link href={`/${locale}/mind-maps/result/${entry.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="sr-only">{openLabel}</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}