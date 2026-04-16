"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  RefreshCw,
  Sparkles,
  BookOpen,
  TrendingUp,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  result: {
    score: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    recommended: string;
    aiFeedback: string;
    fieldScores: Record<string, { correct: number; total: number }>;
    difficultyResults: Record<string, { correct: number; total: number }>;
  };
  onRetake: () => void;
};

const LEVEL_CONFIG = {
  BEGINNER: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-400 to-teal-500",
  },
  INTERMEDIATE: {
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    gradient: "from-amber-400 to-orange-500",
  },
  ADVANCED: {
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    gradient: "from-rose-400 to-pink-500",
  },
};

export function PlacementTestResult({ result, onRetake }: Props) {
  const t = useTranslations("placementTest");
  const levelCfg = LEVEL_CONFIG[result.level];

  const hasBreakdown = Object.keys(result.fieldScores).length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-6">

        {/* Hero Score Card */}
        <Card className="border border-border/60 overflow-hidden">
          <div className={cn("h-2 bg-linear-to-r w-full", levelCfg.gradient)} />
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("result.title")}
              </h1>
              <p className="text-muted-foreground mt-1">{t("result.subtitle")}</p>
            </div>

            {/* Score Circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "text-6xl font-extrabold tabular-nums",
                  levelCfg.color
                )}
              >
                {Math.round(result.score)}
                <span className="text-3xl">%</span>
              </div>
              <Progress value={result.score} className="w-48 h-3" />
            </div>

            {/* Level Badge */}
            <div className={cn("inline-flex items-center gap-2 px-5 py-2 rounded-full border font-semibold text-sm", levelCfg.badge, levelCfg.bg)}>
              <Star className="w-4 h-4" />
              {t(`result.levels.${result.level.toLowerCase()}`)}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Field */}
        <Card className="border border-border/60">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("result.recommendedField")}
              </p>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {result.recommended}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("result.recommendedDescription")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary mb-1">
                {t("result.aiFeedbackTitle")}
              </p>
              <p className="text-foreground text-sm leading-relaxed">
                {result.aiFeedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Field Breakdown */}
        {hasBreakdown && (
          <Card className="border border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t("result.breakdown")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {Object.entries(result.fieldScores).map(([field, { correct, total }]) => {
                const pct = Math.round((correct / total) * 100);
                return (
                  <div key={field} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{field}</span>
                      <span className="text-muted-foreground">
                        {correct}/{total} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onRetake}
            className="flex-1 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("result.retake")}
          </Button>
          <Button asChild className="flex-1 gap-2">
            <Link href="/courses">
              <BookOpen className="w-4 h-4" />
              {t("result.startLearning")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}