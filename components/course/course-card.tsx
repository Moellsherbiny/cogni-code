"use client";

import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Layers, Users, ArrowUpRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseTeacher {
  name?: string | null;
  image?: string | null;
}

interface CourseCount {
  modules?: number | null;
  enrollments?: number | null;
}

interface Course {
  id: string;
  title?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  teacher: CourseTeacher;
  _count: CourseCount;
}

interface CourseCardProps {
  course: Course;
  isRtl?: boolean;
  t: (key: string) => string;
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatCount(n?: number | null): string {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const PLACEHOLDER_THUMBNAIL = "/images/course-placeholder.png";

export function CourseCard({ course, isRtl = false, t }: CourseCardProps) {
  const title = course.title?.trim() || t("untitledCourse");
  const description = course.description?.trim() || null;
  const thumbnail = course.thumbnail?.trim() || PLACEHOLDER_THUMBNAIL;
  const teacherName = course.teacher?.name?.trim() || t("anonymous");
  const teacherImage = course.teacher?.image?.trim() || undefined;
  const moduleCount = course._count?.modules ?? 0;
  const enrollmentCount = course._count?.enrollments ?? 0;

  return (
    <Card
      className={cn(
        "group relative bg-card/50 backdrop-blur-sm",
        "border-border/50 hover:border-primary/50",
        "transition-all duration-500 hover:-translate-y-2",
        // ↓ Key fix: remove any built-in padding so the image bleeds to all edges
        "overflow-hidden flex flex-col h-full p-0",
        "focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2",
      )}
    >
      {/* ── Thumbnail — rendered FIRST, flush to all card edges ─────────── */}
      <div className="relative h-48 bg-muted overflow-hidden shrink-0 rounded-t-xl">
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-linear-to-br from-primary/20 to-blue-600/10
                     group-hover:scale-110 transition-transform duration-700"
        />

        <Image
          src={thumbnail}
          alt={title}
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_THUMBNAIL;
          }}
        />

        <div aria-hidden className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-background/80 backdrop-blur-md text-primary",
              "opacity-0 scale-75 transition-all duration-300",
              "group-hover:opacity-100 group-hover:scale-100",
            )}
          >
            <PlayCircle size={28} aria-hidden />
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      {/* px-6 pt-5 restores comfortable inner spacing BELOW the image */}
      <CardHeader className="px-6 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                       text-primary/70 bg-primary/5 border-primary/10 px-2 py-0.5"
          >
            <Layers size={12} aria-hidden />
            <span>
              {formatCount(moduleCount)}&nbsp;{t("moduleCount")}
            </span>
          </Badge>

          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                       text-muted-foreground bg-muted/60 border-border/40 px-2 py-0.5"
          >
            <Users size={12} aria-hidden />
            <span>{formatCount(enrollmentCount)}</span>
          </Badge>
        </div>

        <h3
          className={cn(
            "text-xl font-bold group-hover:text-primary transition-colors line-clamp-2",
            isRtl ? "leading-[1.4]" : "leading-tight",
          )}
          title={title}
        >
          {title}
        </h3>

        {description ? (
          <p className="text-muted-foreground text-sm line-clamp-2 min-h-10">
            {description}
          </p>
        ) : (
          <p className="text-muted-foreground/40 text-sm italic min-h-10 flex items-center gap-1.5">
            <BookOpen size={13} aria-hidden />
            {t("noDescription")}
          </p>
        )}
      </CardHeader>

      {/* ── Instructor ────────────────────────────────────────────────────── */}
      <CardContent className="mt-auto px-6 pb-4 pt-0">
        <div
          className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-xl
                        border border-border/50 transition-colors group-hover:bg-muted/60"
        >
          <Avatar className="h-9 w-9 border border-primary/10 shrink-0">
            <AvatarImage src={teacherImage} alt={teacherName} />
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {getInitials(teacherName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
              {t("instructor")}
            </span>
            <span className="text-xs font-bold truncate" title={teacherName}>
              {teacherName}
            </span>
          </div>
        </div>
      </CardContent>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <CardFooter className="px-6 pt-0 pb-6">
        <Button
          asChild
          className="w-full rounded-xl font-bold h-11 shadow-lg shadow-primary/5"
        >
          <Link href={`/courses/${course.id}`} aria-label={`${t("viewDetails")}: ${title}`}>
            {t("viewDetails")}
            <ArrowUpRight
              size={18}
              aria-hidden
              className={cn(
                "ms-2 transition-transform",
                isRtl
                  ? "group-hover:-translate-x-1 group-hover:-translate-y-1"
                  : "group-hover:translate-x-1 group-hover:-translate-y-1",
              )}
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}