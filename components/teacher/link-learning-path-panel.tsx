"use client";

import { useState, useMemo, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Map, Plus, X, Search, BookOpen, Loader2, Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  linkCourseToPath,
  unlinkCourseFromPath,
} from "@/actions/teacher/teacher";

interface LinkedPath {
  learningPathId: string;
  order: number;
  learningPath: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
}

interface AvailablePath {
  id: string;
  title: string;
  thumbnail: string | null;
  _count: { courses: number };
}

interface LinkLearningPathPanelProps {
  courseId: string;
  linkedPaths: LinkedPath[];
  availablePaths: AvailablePath[];
}

export function LinkLearningPathPanel({
  courseId,
  linkedPaths: initialLinked,
  availablePaths,
}: LinkLearningPathPanelProps) {
  const t = useTranslations("teacher.linkPaths");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [linked, setLinked] = useState(initialLinked);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkedIds = useMemo(() => new Set(linked.map((l) => l.learningPathId)), [linked]);

  const filteredPaths = useMemo(
    () =>
      availablePaths.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      ),
    [availablePaths, search]
  );

  function openDialog() {
    setSelected(null);
    setSearch("");
    setDialogOpen(true);
  }

  function handleLink() {
    if (!selected) return;
    const path = availablePaths.find((p) => p.id === selected);
    if (!path) return;

    startTransition(async () => {
      try {
        await linkCourseToPath(courseId, selected);
        setLinked((prev) => [
          ...prev,
          {
            learningPathId: path.id,
            order: prev.length,
            learningPath: { id: path.id, title: path.title, thumbnail: path.thumbnail },
          },
        ]);
        toast.success(t("addSuccess"));
        setDialogOpen(false);
      } catch {
        toast.error("Failed to link.");
      }
    });
  }

  function handleUnlink(learningPathId: string) {
    startTransition(async () => {
      try {
        await unlinkCourseFromPath(courseId, learningPathId);
        setLinked((prev) => prev.filter((l) => l.learningPathId !== learningPathId));
        toast.success(t("removeSuccess"));
      } catch {
        toast.error("Failed to remove link.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div
        className={cn(
          "flex items-center justify-between",
          isRtl && "flex-row-reverse"
        )}
      >
        <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">{t("title")}</p>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={openDialog}
        >
          <Plus className="w-3.5 h-3.5" />
          {t("link")}
        </Button>
      </div>

      {/* Linked paths list */}
      {linked.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 rounded-xl border border-dashed border-border/60 text-muted-foreground">
          <Map className="w-7 h-7 opacity-30" />
          <p className="text-xs">{t("noLinks")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {linked.map(({ learningPath, learningPathId }) => (
            <div
              key={learningPathId}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 bg-card group",
                isRtl && "flex-row-reverse"
              )}
            >
              {learningPath.thumbnail ? (
                <img
                  src={learningPath.thumbnail}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500/20 to-indigo-500/10 shrink-0 flex items-center justify-center">
                  <Map className="w-4 h-4 text-violet-500/60" />
                </div>
              )}
              <span className="text-sm font-medium flex-1 truncate">
                {learningPath.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all shrink-0"
                disabled={isPending}
                onClick={() => handleUnlink(learningPathId)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add to path dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("link")}</DialogTitle>
            <DialogDescription>{t("subtitle")}</DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="ps-9 h-9 text-sm"
            />
          </div>

          {/* Path list */}
          <div className="space-y-1 max-h-64 overflow-y-auto -mx-1 px-1">
            {filteredPaths.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {t("noResults")}
              </p>
            ) : (
              filteredPaths.map((path) => {
                const isLinked = linkedIds.has(path.id);
                const isSelected = selected === path.id;
                return (
                  <button
                    key={path.id}
                    type="button"
                    disabled={isLinked}
                    onClick={() => !isLinked && setSelected(isSelected ? null : path.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-start transition-all",
                      isLinked
                        ? "border-border/30 bg-muted/30 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/50 hover:border-primary/40 hover:bg-muted/40",
                      isRtl && "flex-row-reverse"
                    )}
                  >
                    {path.thumbnail ? (
                      <img
                        src={path.thumbnail}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-border/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-linear-to-br from-violet-500/20 to-indigo-500/10 shrink-0 flex items-center justify-center">
                        <Map className="w-4 h-4 text-violet-500/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{path.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("courses", { count: path._count.courses })}
                      </p>
                    </div>
                    {isLinked && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {t("alreadyLinked")}
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <Separator />

          <DialogFooter className={cn(isRtl && "flex-row-reverse sm:flex-row-reverse")}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selected || isPending}
              onClick={handleLink}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              ) : (
                <Plus className="w-3.5 h-3.5 me-1.5" />
              )}
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}