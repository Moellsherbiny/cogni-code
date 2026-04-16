"use client";

import {
  Users,
  Eye,
  Puzzle,
  BookOpen,
  ChevronRight,
  Mic,
  Layout,
  Sparkles,
  Share2,
  FileText,
  Workflow,
  Presentation,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CogniCodeLanding() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [isNotTeacher, setIsNotTeacher] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (session?.data?.user?.role !== "TEACHER") {
      setIsNotTeacher(true);
    }
  });
  const audiences = [
    { icon: Users, key: "allAges" },
    { icon: Eye, key: "visual" },
    { icon: Puzzle, key: "autism" },
    { icon: BookOpen, key: "learning" },
  ];

  const features = [
    { key: "adaptive", icon: <Workflow className="w-5 h-5" /> },
    { key: "whiteboard", icon: <Share2 className="w-5 h-5" /> },
    { key: "mindmap", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    // dir={isRtl ? 'rtl' : 'ltr'} ensures the browser handles the flow automatically
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-500",
        isRtl ? "font-arabic" : "font-sans", // Assuming you have an Arabic font configured
      )}
    >
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-150 w-full max-w-4xl bg-primary/10 dark:bg-primary/5 blur-[120px] rounded-full opacity-70" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div className="space-y-8 text-center lg:text-start">
            <Badge
              variant="secondary"
              className="py-1.5 px-4 bg-primary/10 text-primary border-primary/20 gap-2 animate-in fade-in slide-in-from-bottom-2"
            >
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t("badge")}
              </span>
            </Badge>

            <h1
              className={cn(
                "text-5xl lg:text-7xl font-black tracking-tight",
                isRtl ? "leading-[1.2]" : "leading-[0.95]", // Arabic needs more vertical breathing room
              )}
            >
              {t("heroTitle1")} <br />
              <span className="bg-linear-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent italic">
                {t("heroTitle2")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("heroDesc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {session.data?.user ? (
                isNotTeacher ? (
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-10 rounded-full font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group"
                  >
                    <Link href="/student" className="flex items-center">
                      {t("startLearning")}
                      {/* rtl:-scale-x-100 flips the arrow for Arabic */}
                      <ChevronRight
                        size={20}
                        className="ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                      />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-10 rounded-full font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group"
                  >
                    <Link href="/teacher" className="flex items-center">
                      {t("startTeaching")}
                      {/* rtl:-scale-x-100 flips the arrow for Arabic */}
                      <ChevronRight
                        size={20}
                        className="ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                      />
                    </Link>
                  </Button>
                )
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-10 rounded-full font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group"
                >
                  <Link href="/auth/login" className="flex items-center">
                    {t("startLearning")}
                    {/* rtl:-scale-x-100 flips the arrow for Arabic */}
                    <ChevronRight
                      size={20}
                      className="ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                    />
                  </Link>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-10 rounded-full font-bold text-base backdrop-blur-sm bg-background/50 hover:bg-muted/50"
              >
                <Link href="/courses">{t("exploreCourses")}</Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-10 pt-10 border-t border-border/50 justify-center lg:justify-start">
              {[
                ["10+", t("stats.courses")],
                ["6", t("stats.groups")],
                ["100%", t("stats.inclusive")],
              ].map(([num, label]) => (
                <div key={label} className="group">
                  <div className="text-3xl font-black group-hover:text-primary transition-colors">
                    {num}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- HERO MOCKUP --- */}
          <div
            className={cn(
              "relative animate-in zoom-in duration-700 delay-200",
              isRtl ? "lg:mr-8" : "lg:ml-8",
            )}
          >
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-blue-500/20 rounded-[3rem] blur-3xl opacity-50" />

            <div className="relative bg-card/90 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
              {/* Window Controls - Keep circles on the left (OS standard) but move text */}
              <div className="bg-muted/30 px-6 py-4 flex justify-between items-center border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500/50 rounded-full" />
                  <div className="w-3 h-3 bg-amber-500/50 rounded-full" />
                  <div className="w-3 h-3 bg-emerald-500/50 rounded-full" />
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                  CogniPanel v2.0
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Progress Card */}
                <div className="bg-background/50 p-4 rounded-2xl border border-border/40">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase mb-1">
                        {t("stats.inclusive")}
                      </p>
                      <h4 className="text-sm font-bold">Logic Module 04</h4>
                    </div>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      75%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]" />
                  </div>
                </div>

                {/* Dashboard Grid Simulation */}
                <div className="grid grid-cols-4 gap-4">
                  {[Workflow, BookOpen, Layout, Presentation].map((Icon, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-2xl flex items-center justify-center transition-all border",
                        i < 3
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted/50 border-border/50 text-muted-foreground opacity-40",
                      )}
                    >
                      {i < 3 ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                    </div>
                  ))}
                </div>

                {/* Voice UI */}
                <div className="bg-linear-to-r from-primary/10 to-transparent rounded-2xl p-4 border-s-4 border-primary">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                        <Mic size={18} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        "Optimize interface for readability"
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        AI is adjusting contrast settings...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AUDIENCE SECTION --- */}
      <section
        id="audience"
        className="py-24 bg-muted/30 dark:bg-muted/10 border-y border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black">
              {t("audienceTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("audienceDesc")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((item, i) => {
              const Icon = item.icon;
              return (
                <Card
                  key={i}
                  className="group hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 bg-background shadow-sm hover:shadow-xl"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon size={24} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {t(`audiences.${item.key}.label`)}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {t(`audiences.${item.key}.desc`)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <h2
                className={cn(
                  "text-4xl md:text-6xl font-black",
                  isRtl ? "leading-[1.3]" : "leading-tight",
                )}
              >
                {t("featuresTitle")} <br />
                <span className="text-primary underline decoration-primary/20 underline-offset-8">
                  {t("featuresHighlight")}
                </span>
              </h2>

              <div className="grid gap-10">
                {features.map((feat, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-14 h-14 bg-background border border-border shadow-sm flex items-center justify-center rounded-2xl text-primary group-hover:scale-110 group-hover:border-primary transition-all duration-300">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {t(`features.${feat.key}.title`)}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {t(`features.${feat.key}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Visual Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-3 scale-105 -z-10" />
              <div className="bg-card dark:bg-muted/10 rounded-[3rem] p-8 lg:p-12 border border-border/50 shadow-inner">
                <div className="space-y-6">
                  <div className="p-6 bg-background rounded-3xl border border-border shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 inset-s-0 w-1 h-full bg-emerald-500" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        AI Diagnosis Engine
                      </span>
                    </div>
                    <p className="text-sm font-medium italic leading-relaxed text-foreground/80">
                      "Current logic density: 85%. Transitioning module to
                      'Advanced Patterns' to maintain optimal engagement flow."
                    </p>
                  </div>

                  <div className="h-48 bg-background/50 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors group">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Layout className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Visual Logic Tree Interface
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-3 font-black text-3xl tracking-tighter">
            <div className="w-10 h-10 bg-primary rounded-xl rotate-3 flex items-center justify-center text-primary-foreground shadow-lg">
              C
            </div>
            <span>CogniCode</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-loose">
            Breaking barriers in tech education through AI-driven inclusivity.
            Made with passion for the global Arabic developer community.
          </p>
          <div className="pt-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} CogniCode Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
