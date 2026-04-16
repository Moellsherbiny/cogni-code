"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Clock,
  Target,
  BarChart3,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

type Props = {
  onStart: () => void;
  isLoading: boolean;
};

export function PlacementTestIntro({ onStart, isLoading }: Props) {
  const t = useTranslations("placementTest");

  const features = [
    {
      icon: Clock,
      title: t("intro.features.time.title"),
      description: t("intro.features.time.description"),
    },
    {
      icon: Target,
      title: t("intro.features.adaptive.title"),
      description: t("intro.features.adaptive.description"),
    },
    {
      icon: BarChart3,
      title: t("intro.features.results.title"),
      description: t("intro.features.results.description"),
    },
    {
      icon: Brain,
      title: t("intro.features.ai.title"),
      description: t("intro.features.ai.description"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-linear-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="text-center max-w-2xl mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          {t("intro.badge")}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {t("intro.title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("intro.subtitle")}
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-10">
        {features.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="border border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
          >
            <CardContent className="p-5 flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{title}</p>
                <p className="text-muted-foreground text-sm mt-1">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Button
        size="lg"
        onClick={onStart}
        disabled={isLoading}
        className="gap-2 px-8 py-6 text-base rounded-xl shadow-lg shadow-primary/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("intro.loading")}
          </>
        ) : (
          <>
            {t("intro.startButton")}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        {t("intro.disclaimer")}
      </p>
    </div>
  );
}