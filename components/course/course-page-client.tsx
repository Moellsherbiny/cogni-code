"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  Paperclip,
  Layers,
  Users,
  BookOpen,
  Clock,
  CalendarDays,
  CheckCircle2,
  Monitor,
  Award,
  Infinity as InfinityIcon,
  Copy,
  Check,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  CoursePageData,
  CoursePageLesson,
  CoursePageModule,
  LessonType,
  StudentLevel,
} from "@/types/course";
import { useTranslations } from "next-intl";
import Navbar from "../layout/navbar";
import { enrollCourse } from "@/actions/student/courses";
import { toast } from "sonner";



interface CoursePageProps {
  course: CoursePageData;
  isTeacher: boolean;
  studentId: string;
  isRtl?: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLACEHOLDER = "/images/course-placeholder.png";

const LEVEL_STYLES: Record<StudentLevel, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-500  border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10  text-amber-500   border-amber-500/20",
  ADVANCED: "bg-rose-500/10   text-rose-500    border-rose-500/20",
};

const LEVEL_LABELS: Record<StudentLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// Lessons don't have duration in this schema — we count them instead
function totalLessons(modules: CoursePageModule[]) {
  return modules.reduce((s, m) => s + m.lessons.length, 0);
}

function completedLessons(modules: CoursePageModule[]) {
  return modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.progress?.[0]?.completed).length;
}

function lessonIcon(type: LessonType) {
  if (type === "VIDEO")
    return <PlayCircle size={13} className="text-primary/70 shrink-0" />;
  if (type === "MATERIAL")
    return <Paperclip size={13} className="text-amber-500/70 shrink-0" />;
  return <FileText size={13} className="text-sky-500/70 shrink-0" />;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/40 border border-border/50">
      <span className="text-primary">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-bold">{value}</span>
      </div>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: CoursePageLesson }) {
  const done = lesson.progress?.[0]?.completed ?? false;
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg text-sm",
        "border transition-colors",
        done
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-background/60 border-border/30 hover:border-border/60",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {done ? (
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
        ) : (
          lessonIcon(lesson.type)
        )}
        <span
          className={cn(
            "font-medium truncate",
            done && "line-through text-muted-foreground/60",
          )}
        >
          {lesson.title}
        </span>
      </div>
      <Badge
        variant="outline"
        className="text-[9px] uppercase tracking-wider font-bold shrink-0 border-border/40"
      >
        {lesson.type}
      </Badge>
    </li>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CoursePage({ course, isRtl = false, isTeacher, studentId }: CoursePageProps) {
  const t = useTranslations("coursePage");
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const thumbnail = (!imgError && course.thumbnail) || PLACEHOLDER;
  const teacherName = course.teacher.name?.trim() || t("anonymous");
  const teacherImg = course.teacher.image ?? undefined;
  const modules = course.modules;
  const total = totalLessons(modules);
  const done = completedLessons(modules);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  async function handleEnrollment() {
    try{
      const res = await enrollCourse(studentId, course.id);
      toast.success("Enrolled successfully!");
    }catch{
      toast.error("Failed to enroll. Please try again.");
    }

  }
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <Navbar />
      <div className={cn("min-h-screen pt-24 bg-background", isRtl && "rtl")}>
        {/* ── Cinematic Hero ─────────────────────────────────────────────────── */}
        <div className="relative w-[90%] h-100 md:h-125 mx-auto overflow-hidden rounded-2xl">
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
          {/* layered gradients for depth */}
          <div className="absolute inset-0 bg-linear-to-t  from-background via-background/75 to-background/10" />
          <div className="absolute inset-0 bg-linear-to-r  from-background/50 to-transparent" />
          {/* subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Back */}
          <div className="absolute top-6 left-6 z-10">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 bg-background/60 backdrop-blur-md border border-border/50
                       hover:bg-background/80 rounded-xl text-sm font-semibold"
            >
              <Link href="/courses">
                <BackArrow size={15} />
                {t("backToCourses")}
              </Link>
            </Button>
          </div>

          {/* Hero text */}
          <div className="absolute bottom-0 inset-x-0 px-6 md:px-10 pb-8 space-y-3 max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge
                className="bg-primary/15 text-primary border-primary/25
                              text-[10px] font-bold uppercase tracking-widest"
              >
                <Layers size={10} className="me-1" />
                {modules.length}&nbsp;{t("modules")}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted/60 text-muted-foreground border-border/40
                         text-[10px] font-bold uppercase tracking-widest"
              >
                <Users size={10} className="me-1" />
                {formatCount(course._count.enrollments)}&nbsp;{t("students")}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted/60 text-muted-foreground border-border/40
                         text-[10px] font-bold uppercase tracking-widest"
              >
                <BookOpen size={10} className="me-1" />
                {total}&nbsp;{t("lessons")}
              </Badge>
            </div>

            <h1
              className={cn(
                "text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl",
                isRtl ? "leading-[1.35]" : "leading-tight",
              )}
            >
              {course.title}
            </h1>

            {course.description && (
              <p className="text-muted-foreground text-base max-w-2xl line-clamp-2">
                {course.description}
              </p>
            )}

            {/* Instructor chip */}
            <div className="flex items-center gap-2 pt-1">
              <Avatar className="h-7 w-7 border border-primary/20">
                <AvatarImage src={teacherImg} alt={teacherName} />
                <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                  {getInitials(teacherName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground font-medium">
                {t("instructor")}:&nbsp;
                <span className="text-foreground font-semibold">
                  {teacherName}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div
          className="max-w-6xl mx-auto px-4 md:px-8 py-10
                      grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          {/* ── Main column (2/3) ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Progress bar — only when enrolled & has progress */}
            {course.isEnrolled && total > 0 && (
              <div className="p-5 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-primary" />
                    {t("yourProgress")}
                  </span>
                  <span className="text-primary">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {done} / {total}&nbsp;{t("lessonsCompleted")}
                </p>
              </div>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap gap-3">
              <StatPill
                icon={<BookOpen size={15} />}
                label={t("lessons")}
                value={String(total)}
              />
              <StatPill
                icon={<Layers size={15} />}
                label={t("modules")}
                value={String(modules.length)}
              />
              <StatPill
                icon={<Users size={15} />}
                label={t("students")}
                value={formatCount(course._count.enrollments)}
              />
              <StatPill
                icon={<CalendarDays size={15} />}
                label={t("lastUpdated")}
                value={new Date(course.updatedAt).toLocaleDateString(
                  isRtl ? "ar-EG" : "en-US",
                  { year: "numeric", month: "short" },
                )}
              />
            </div>

            {/* Course content accordion */}
            <section>
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Layers size={20} className="text-primary" />
                {t("courseContent")}
              </h2>

              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t("noModules")}
                </p>
              ) : (
                <Accordion
                  type="multiple"
                  defaultValue={modules.slice(0, 1).map((m) => m.id)}
                  className="space-y-3"
                >
                  {modules.map((mod, idx) => {
                    const modDone = mod.lessons.filter(
                      (l) => l.progress?.[0]?.completed,
                    ).length;
                    const modPct =
                      mod.lessons.length > 0
                        ? Math.round((modDone / mod.lessons.length) * 100)
                        : 0;

                    return (
                      <AccordionItem
                        key={mod.id}
                        value={mod.id}
                        className="border border-border/50 rounded-xl overflow-hidden bg-muted/20 px-0"
                      >
                        <AccordionTrigger
                          className="px-5 py-4 hover:no-underline hover:bg-muted/40
                                   data-[state=open]:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 w-full me-3">
                            {/* Index badge */}
                            <span
                              className="flex items-center justify-center h-7 w-7 rounded-lg
                                           bg-primary/10 text-primary text-xs font-extrabold shrink-0"
                            >
                              {idx + 1}
                            </span>

                            <div className="flex-1 text-start">
                              <p className="font-semibold text-sm">
                                {mod.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">
                                  {mod.lessons.length}&nbsp;{t("lessons")}
                                </span>
                                <span className="text-muted-foreground/30 text-xs">
                                  ·
                                </span>
                                <Badge
                                  className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 border",
                                    LEVEL_STYLES[mod.level],
                                  )}
                                >
                                  {LEVEL_LABELS[mod.level]}
                                </Badge>
                              </div>
                            </div>

                            {/* Mini progress ring for enrolled users */}
                            {course.isEnrolled && mod.lessons.length > 0 && (
                              <span className="text-[10px] font-bold text-primary shrink-0">
                                {modPct}%
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-5 pb-4 pt-2">
                          {mod.description && (
                            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                              {mod.description}
                            </p>
                          )}
                          {mod.lessons.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              {t("noLessons")}
                            </p>
                          ) : (
                            <ul className="space-y-1.5">
                              {mod.lessons
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((lesson) => (
                                  <LessonRow key={lesson.id} lesson={lesson} />
                                ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </section>

            <Separator className="opacity-40" />

            {/* Instructor card */}
            <section>
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                {t("aboutInstructor")}
              </h2>
              <div
                className="flex items-start gap-4 p-5 rounded-2xl
                            bg-muted/30 border border-border/50"
              >
                <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
                  <AvatarImage src={teacherImg} alt={teacherName} />
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                    {getInitials(teacherName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-bold">{teacherName}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.teacher.email}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Sticky sidebar (1/3) ──────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div
              className="sticky top-6 space-y-5 rounded-2xl border border-border/50
                          bg-card/60 backdrop-blur-sm p-6 shadow-xl shadow-black/5"
            >
              {/* CTA */}
              {
                !isTeacher &&
                course.isEnrolled ? (
                <Button
                  asChild
                  className="w-full h-12 rounded-xl font-bold text-base
                                          shadow-lg shadow-primary/10"
                >
                  <Link href={`/student/courses/${course.id}/`}>
                    <PlayCircle size={18} className="me-2" />
                    {t("startLearning")}
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full h-12 rounded-xl font-bold text-base
                                  shadow-lg shadow-primary/10"
                  onClick={ async ()=> await handleEnrollment()}
                >
                  {t("enroll")}
                </Button>
              )
              }

              {/* Copy link */}
              <Button
                variant="outline"
                onClick={handleCopy}
                className="w-full h-10 rounded-xl font-semibold text-sm
              border-border/50 hover:border-primary/40 gap-2"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    {t("linkCopied")}
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {t("copyLink")}
                  </>
                )}
              </Button>

              <Separator className="opacity-40" />

              {/* Course includes */}
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest
                            text-muted-foreground mb-3"
                >
                  {t("courseIncludes")}
                </p>
                <ul className="space-y-2.5">
                  {(
                    [
                      [<InfinityIcon size={14} />, t("fullLifetimeAccess")],
                      [<Monitor size={14} />, t("accessOnAllDevices")],
                      [<Award size={14} />, t("certificateOfCompletion")],
                    ] as [React.ReactNode, string][]
                  ).map(([icon, label]) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="text-primary">{icon}</span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="opacity-40" />

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t("modules"), value: String(modules.length) },
                  { label: t("lessons"), value: String(total) },
                  {
                    label: t("students"),
                    value: formatCount(course._count.enrollments),
                    full: true,
                  },
                ].map(({ label, value, full }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl",
                      "bg-muted/40 border border-border/40 text-center",
                      full && "col-span-2",
                    )}
                  >
                    <span className="text-lg font-extrabold">{value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Enrolled progress summary in sidebar */}
              {course.isEnrolled && total > 0 && (
                <>
                  <Separator className="opacity-40" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        {t("yourProgress")}
                      </span>
                      <span className="text-primary">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
