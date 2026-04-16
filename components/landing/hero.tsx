"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, BookOpen, BrainCircuit, ChevronRight, 
  Eye, Puzzle, Users, CheckCircle2, Sparkles 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
const audiences = [
  { icon: <Users size={18} />, label: "All Ages" },
  { icon: <Eye size={18} />, label: "Visually Impaired" },
  { icon: <Puzzle size={18} />, label: "Autism Spectrum" },
  { icon: <BookOpen size={18} />, label: "Learning Difficulties" },
  { icon: <BarChart3 size={18} />, label: "Teachers" },
];

const stats = [
  { num: "10+", label: "Expert Courses" },
  { num: "6", label: "Target Groups" },
  { num: "AI", label: "Adaptive Engine" },
  { num: "100%", label: "Inclusive" },
];

export default function Hero() {
  const session = useSession();

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-150 w-full max-w-300 bg-primary/10 blur-[120px] rounded-full opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col items-start text-left space-y-8">
            <Badge variant="outline" className="px-4 py-3 bg-background/50 backdrop-blur-sm border-primary/20 gap-2 animate-fade-in">
              <BrainCircuit size={32} className="text-primary" />
              <span className="text-sm font-medium tracking-tight py-2">AI-Powered Adaptive Learning</span>
            </Badge>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
                Potential.
              </span>
              <br />
              Learn to Code.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              The first Arabic-origin platform combining adaptive AI, 
              inclusive design for all abilities, and real-time collaboration.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-base font-bold shadow-xl shadow-primary/20 group">
                <Link href="/student" className="flex items-center gap-2">
                  Start Learning Free 
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-bold backdrop-blur-sm">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-border/60 w-full">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tracking-tight">{stat.num}</span>
                  <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT VISUAL (Mockup) */}
          <div className="relative group">
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-500" />
            
            <div className="relative bg-card border border-border/50 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Browser Header */}
              <div className="bg-muted/50 border-b border-border/50 px-6 py-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="mx-auto text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-md border border-border/50">
                  cognicode.ai/dashboard
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Adaptive Path</h4>
                  <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
                    {["Basics", "Logic", "UI", "Final"].map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-4 border-card transition-all",
                          i < 2 ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
                        )}>
                          {i < 2 ? <CheckCircle2 size={18} /> : <span className="text-xs">{i+1}</span>}
                        </div>
                        <span className="text-[10px] font-bold uppercase">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold">Today's Focus</span>
                    <Sparkles size={14} className="text-primary animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {["Intro to AI Logic", "Inclusive Design Quiz"].map((task) => (
                      <div key={task} className="flex items-center gap-3 bg-background p-3 rounded-xl border border-border/50 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs font-medium">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Overall Progress</span>
                    <span className="text-primary">78%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[78%] rounded-full shadow-[0_0_12px_rgba(var(--primary),0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIENCE SECTION */}
      <div className="mt-20 py-10 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">
            Empowering every type of learner
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {audiences.map((a) => (
              <div 
                key={a.label} 
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-background border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  {a.icon}
                </div>
                <span className="text-sm font-semibold tracking-tight">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}