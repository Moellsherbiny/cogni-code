"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, X, GripVertical, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { createLearningPath, updateLearningPath } from "@/actions/teacher/teacher";
import { cn } from "@/lib/utils";

interface CourseOption {
  id: string;
  title: string;
  thumbnail?: string | null;
}

interface LearningPathFormProps {
  availableCourses: CourseOption[];
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    courses: CourseOption[];
  };
  onSuccess: (pathId: string) => void;
}

export function LearningPathForm({
  availableCourses,
  initialData,
  onSuccess,
}: LearningPathFormProps) {
  const t = useTranslations("teacher.learningPathForm");
  const tv = useTranslations("teacher.validation");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [desc, setDesc] = useState(initialData?.description ?? "");
  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail ?? null);
  const [selectedCourses, setSelectedCourses] = useState<CourseOption[]>(initialData?.courses ?? []);
  const [search, setSearch] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Filtered available courses (not yet added)
  const filteredCourses = useMemo(() => {
    const addedIds = new Set(selectedCourses.map((c) => c.id));
    return availableCourses.filter(
      (c) =>
        !addedIds.has(c.id) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableCourses, selectedCourses, search]);

  function addCourse(course: CourseOption) {
    setSelectedCourses((p) => [...p, course]);
    setSearch("");
  }

  function removeCourse(id: string) {
    setSelectedCourses((p) => p.filter((c) => c.id !== id));
  }

  // Simple swap-based reorder (no external dnd lib needed for small lists)
  function moveUp(index: number) {
    if (index === 0) return;
    setSelectedCourses((p) => {
      const next = [...p];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setSelectedCourses((p) => {
      if (index === p.length - 1) return p;
      const next = [...p];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setTitleError(tv("titleRequired")); return; }
    if (title.trim().length < 3) { setTitleError(tv("titleMin")); return; }
    setTitleError(undefined);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: desc || undefined,
        thumbnail: thumbnail ?? undefined,
        courseIds: selectedCourses.map((c) => c.id),
      };

      if (initialData) {
        await updateLearningPath(initialData.id, payload);
        onSuccess(initialData.id);
      } else {
        const path = await createLearningPath(payload);
        onSuccess(path.id);
      }
    } catch {
      toast.error("Failed to save learning path.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="lp-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("titleLabel")}
        </Label>
        <Input
          id="lp-title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(undefined); }}
          placeholder={t("titlePlaceholder")}
          className={cn("h-10", titleError && "border-destructive")}
        />
        {titleError && <p className="text-xs text-destructive" role="alert">{titleError}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="lp-desc" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("descLabel")}
        </Label>
        <Textarea
          id="lp-desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t("descPlaceholder")}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("thumbnailLabel")}
        </Label>
        <ThumbnailUploader value={thumbnail} onChange={setThumbnail} />
      </div>

      {/* Courses */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("coursesLabel")}
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("coursesHint")}</p>
        </div>

        {/* Selected courses (ordered list) */}
        {selectedCourses.length > 0 ? (
          <div className="space-y-2">
            {selectedCourses.map((course, index) => (
              <div
                key={course.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/60 bg-card"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <Badge variant="outline" className="text-[10px] font-bold shrink-0 w-6 h-6 justify-center p-0 rounded-full">
                  {index + 1}
                </Badge>
                {course.thumbnail && (
                  <img src={course.thumbnail} alt="" className="w-8 h-8 rounded-md object-cover shrink-0 border border-border/40" />
                )}
                <span className="text-sm font-medium flex-1 truncate">{course.title}</span>
                <div className="flex gap-0.5 shrink-0">
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-xs"
                    onClick={() => moveUp(index)} disabled={index === 0}>↑</Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-xs"
                    onClick={() => moveDown(index)} disabled={index === selectedCourses.length - 1}>↓</Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive"
                    onClick={() => removeCourse(course.id)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border/60 rounded-xl">
            {t("noCoursesAdded")}
          </p>
        )}

        {/* Course search */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchCourses")}
              className="ps-9 h-9 text-sm"
            />
          </div>

          {search && (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden max-h-48 overflow-y-auto">
              {filteredCourses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t("noCourses")}</p>
              ) : (
                filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => addCourse(course)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-start border-b border-border/30 last:border-0"
                  >
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-7 h-7 rounded-md object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-muted shrink-0" />
                    )}
                    <span className="text-sm truncate">{course.title}</span>
                    <Plus className="w-3.5 h-3.5 text-muted-foreground ms-auto shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full h-10 font-semibold" disabled={saving}>
        {saving ? (
          <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t("submitting")}</>
        ) : initialData ? t("submitEdit") : t("submit")}
      </Button>
    </form>
  );
}