"use client";

import React, { useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Crown, Medal, RefreshCw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/actions/leaderboard";

// ─── Medal config ─────────────────────────────────────────────────────────────

const MEDAL_CONFIG = [
  {
    icon: Crown,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    ring: "ring-amber-300 dark:ring-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    glow: "shadow-amber-200/60 dark:shadow-amber-900/60",
  },
  {
    icon: Medal,
    bg: "bg-slate-50 dark:bg-slate-900/40",
    ring: "ring-slate-300 dark:ring-slate-500",
    text: "text-slate-500 dark:text-slate-400",
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    glow: "shadow-slate-200/60 dark:shadow-slate-800/60",
  },
  {
    icon: Medal,
    bg: "bg-orange-50 dark:bg-orange-950/30",
    ring: "ring-orange-300 dark:ring-orange-700",
    text: "text-orange-600 dark:text-orange-400",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    glow: "shadow-orange-200/60 dark:shadow-orange-900/60",
  },
] as const;

// ─── Podium cards (top 3) ─────────────────────────────────────────────────────

function PodiumCard({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const t = useTranslations("leaderboard");
  const locale = useLocale();
  const cfg = MEDAL_CONFIG[entry.rank - 1];
  const Icon = cfg.icon;
  const labelKey = (["gold", "silver", "bronze"] as const)[entry.rank - 1];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center",
        "transition-all duration-300 hover:-translate-y-1",
        "shadow-lg",
        cfg.bg,
        cfg.glow,
        // first-place card is slightly larger
        entry.rank === 1 ? "ring-2 scale-105 z-10" : "ring-1",
        cfg.ring
      )}
    >
      {/* Rank badge */}
      <span
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
          cfg.badge
        )}
      >
        {t(`top3.${labelKey}`)}
      </span>

      {/* Icon */}
      <Icon className={cn("w-6 h-6 mt-1", cfg.text)} />

      {/* Avatar */}
      <div className="relative">
        <Avatar className={cn("w-16 h-16 ring-2", cfg.ring)}>
          <AvatarImage src={entry.image ?? undefined} alt={entry.name} />
          <AvatarFallback className="text-lg font-bold">
            {entry.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isCurrentUser && (
          <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-primary text-primary-foreground px-1 rounded-full">
            {t("you")}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2 max-w-30">
        {entry.name}
      </p>

      {/* Score */}
      <p className={cn("text-2xl font-black tabular-nums", cfg.text)}>
        {entry.score.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardClient({
  entries,
  currentUserId,
}: LeaderboardClientProps) {
  const t = useTranslations("leaderboard");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isRtl = locale === "ar";

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const refresh = () =>
    startTransition(() => {
      router.refresh();
    });

  // Format relative time with correct locale
  const relativeTime = (date: Date) =>
    formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: isRtl ? ar : enUS,
    });

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-background px-4 py-24 sm:px-8"
    >
      {/* ── Header ── */}
      <div className="mx-auto max-w-3xl mb-10 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>

        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-2 text-xs"
          onClick={refresh}
          disabled={isPending}
        >
          <RefreshCw
            className={cn("w-3.5 h-3.5", isPending && "animate-spin")}
          />
          {isPending ? "..." : t("refreshed")}
        </Button>
      </div>

      <div className="mx-auto max-w-3xl space-y-10">
        {entries.length === 0 ? (
          // ── Empty state ──
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
            <Trophy className="w-12 h-12 opacity-20" />
            <p className="text-sm">{t("empty")}</p>
          </div>
        ) : (
          <>
            {/* ── Podium (top 3) ── */}
            {top3.length > 0 && (
              <div
                className={cn(
                  "grid gap-4 items-end",
                  top3.length === 1
                    ? "grid-cols-1 max-w-50 mx-auto"
                    : top3.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                )}
              >
                {top3.length === 3
                  ? // Reorder visually: silver | gold | bronze
                    [top3[1], top3[0], top3[2]].map((entry) => (
                      <PodiumCard
                        key={entry.studentId}
                        entry={entry}
                        isCurrentUser={entry.studentId === currentUserId}
                      />
                    ))
                  : top3.map((entry) => (
                      <PodiumCard
                        key={entry.studentId}
                        entry={entry}
                        isCurrentUser={entry.studentId === currentUserId}
                      />
                    ))}
              </div>
            )}

            {/* ── Rest of table (rank 4+) ── */}
            {rest.length > 0 && (
              <div className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead
                        className={cn(
                          "w-16 font-semibold text-xs uppercase tracking-wider",
                          isRtl ? "text-right" : "text-left"
                        )}
                      >
                        {t("rank")}
                      </TableHead>
                      <TableHead
                        className={cn(
                          "font-semibold text-xs uppercase tracking-wider",
                          isRtl ? "text-right" : "text-left"
                        )}
                      >
                        {t("student")}
                      </TableHead>
                      <TableHead
                        className={cn(
                          "font-semibold text-xs uppercase tracking-wider",
                          isRtl ? "text-left" : "text-right"
                        )}
                      >
                        {t("score")}
                      </TableHead>
                      <TableHead
                        className={cn(
                          "hidden sm:table-cell font-semibold text-xs uppercase tracking-wider",
                          isRtl ? "text-left" : "text-right"
                        )}
                      >
                        {t("lastUpdated")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rest.map((entry, i) => {
                      const isMe = entry.studentId === currentUserId;
                      return (
                        <TableRow
                          key={entry.studentId}
                          className={cn(
                            "transition-colors",
                            isMe &&
                              "bg-primary/5 hover:bg-primary/10 font-medium"
                          )}
                          style={{
                            animationDelay: `${i * 40}ms`,
                          }}
                        >
                          {/* Rank */}
                          <TableCell
                            className={cn(
                              "tabular-nums text-muted-foreground font-mono text-sm",
                              isRtl ? "text-right" : "text-left"
                            )}
                          >
                            #{entry.rank}
                          </TableCell>

                          {/* Student */}
                          <TableCell>
                            <div
                              className={cn(
                                "flex items-center gap-3",
                                isRtl && "flex-row-reverse justify-end"
                              )}
                            >
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarImage
                                  src={entry.image ?? undefined}
                                  alt={entry.name}
                                />
                                <AvatarFallback className="text-xs font-bold">
                                  {entry.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate max-w-40">
                                {entry.name}
                              </span>
                              {isMe && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 shrink-0"
                                >
                                  {t("you")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Score */}
                          <TableCell
                            className={cn(
                              "tabular-nums font-bold text-sm",
                              isRtl ? "text-left" : "text-right"
                            )}
                          >
                            {t("points", {
                              score: entry.score.toLocaleString(
                                locale === "ar" ? "ar-EG" : "en-US"
                              ),
                            })}
                          </TableCell>

                          {/* Last updated */}
                          <TableCell
                            className={cn(
                              "hidden sm:table-cell text-xs text-muted-foreground",
                              isRtl ? "text-left" : "text-right"
                            )}
                          >
                            {relativeTime(entry.updatedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}