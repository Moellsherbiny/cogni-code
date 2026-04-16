"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  GripVertical, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  PlayCircle, FileText, Paperclip, Loader2, Check, X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  createModule, updateModule, deleteModule, reorderModules,
  createLesson, updateLesson, deleteLesson, reorderLessons,
} from "@/actions/teacher/teacher";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonType = "VIDEO" | "TEXT" | "MATERIAL";
type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface LessonData {
  id: string; title: string; type: LessonType; order: number;
  content?: string | null; videoUrl?: string | null;
  materialUrl?: string | null; transcript?: string | null;
}
interface ModuleData {
  id: string; title: string; description?: string | null;
  level: Level; order: number; lessons: LessonData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<Level, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const LESSON_ICONS: Record<LessonType, React.ElementType> = {
  VIDEO: PlayCircle, TEXT: FileText, MATERIAL: Paperclip,
};

// ─── Lesson row form ──────────────────────────────────────────────────────────

function LessonForm({
  moduleId, courseId, lesson, order, onDone,
}: {
  moduleId: string; courseId: string;
  lesson?: LessonData; order?: number; onDone: () => void;
}) {
  const t = useTranslations("teacher.lessons");
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [type, setType] = useState<LessonType>(lesson?.type ?? "TEXT");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [materialUrl, setMaterialUrl] = useState(lesson?.materialUrl ?? "");
  const [transcript, setTranscript] = useState(lesson?.transcript ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(), type,
        content: content || undefined,
        videoUrl: videoUrl || undefined,
        materialUrl: materialUrl || undefined,
        transcript: transcript || undefined,
      };
      if (lesson) {
        await updateLesson(lesson.id, courseId, payload);
      } else {
        await createLesson({ moduleId, courseId, order: order ?? 0, ...payload });
      }
      onDone();
    } catch {
      toast.error("Failed to save lesson.");
    }
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/3 p-4 space-y-3">
      {/* Title + type */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("lessonTitlePlaceholder")}
          className="h-9 text-sm"
          autoFocus
        />
        <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["VIDEO", "TEXT", "MATERIAL"] as LessonType[]).map((v) => (
              <SelectItem key={v} value={v}>{t(`types.${v}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditional fields */}
      {type === "TEXT" && (
        <Textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder={t("contentPlaceholder")} rows={4} className="text-sm resize-none" />
      )}
      {type === "VIDEO" && (
        <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
          placeholder={t("videoUrlPlaceholder")} className="h-9 text-sm" />
      )}
      {type === "MATERIAL" && (
        <Input value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)}
          placeholder={t("materialUrlPlaceholder")} className="h-9 text-sm" />
      )}
      {(type === "VIDEO") && (
        <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
          placeholder={t("transcriptPlaceholder")} rows={2} className="text-sm resize-none" />
      )}

      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          <X className="w-3.5 h-3.5 me-1" />{t("cancel")}
        </Button>
        <Button type="button" size="sm" onClick={save} disabled={saving || !title.trim()}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin me-1" /> : <Check className="w-3.5 h-3.5 me-1" />}
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

// ─── Lesson row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson, courseId, moduleId,
  onEdit, onDelete,
}: {
  lesson: LessonData; courseId: string; moduleId: string;
  onEdit: () => void; onDelete: () => void;
}) {
  const t = useTranslations("teacher.lessons");
  const Icon = LESSON_ICONS[lesson.type];
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors group">
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm flex-1 truncate">{lesson.title}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteLesson")}</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => startTransition(async () => { await deleteLesson(lesson.id, courseId); onDelete(); })}
              >
                {t("deleteLesson")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({
  mod, courseId, onUpdate, onDelete,
}: {
  mod: ModuleData; courseId: string;
  onUpdate: (updated: ModuleData) => void;
  onDelete: () => void;
}) {
  const t = useTranslations("teacher.modules");
  const tl = useTranslations("teacher.lessons");

  const [open, setOpen] = useState(true);
  const [editingMod, setEditingMod] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>(mod.lessons);

  // Module title/desc/level inline edit state
  const [title, setTitle] = useState(mod.title);
  const [desc, setDesc] = useState(mod.description ?? "");
  const [level, setLevel] = useState<Level>(mod.level);
  const [saving, setSaving] = useState(false);

  async function saveModule() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateModule(mod.id, courseId, { title: title.trim(), description: desc || undefined, level });
      onUpdate({ ...mod, title: title.trim(), description: desc, level });
      setEditingMod(false);
    } catch { toast.error("Failed to save."); }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab" />

        {editingMod ? (
          <div className="flex-1 grid gap-2">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-sm" autoFocus />
              <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
                <SelectTrigger className="h-8 w-35 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as Level[]).map((l) => (
                    <SelectItem key={l} value={l} className="text-xs">{t(`levels.${l}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder={t("moduleDescPlaceholder")} className="h-8 text-sm" />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingMod(false)}>
                <X className="w-3.5 h-3.5 me-1" />{t("cancel")}
              </Button>
              <Button type="button" size="sm" onClick={saveModule} disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin me-1" /> : <Check className="w-3.5 h-3.5 me-1" />}
                {t("save")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{mod.title}</span>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide", LEVEL_COLORS[mod.level])}>
                  {t(`levels.${mod.level}`)}
                </span>
              </div>
              {mod.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{mod.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingMod(true)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteModule")}</AlertDialogTitle>
                    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={onDelete}>
                      {t("deleteModule")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen((p) => !p)}>
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Lessons */}
      {open && (
        <div className="p-3 space-y-2">
          {lessons.length === 0 && !addingLesson && (
            <p className="text-xs text-muted-foreground text-center py-3">{tl("noLessons")}</p>
          )}

          {lessons.map((lesson) =>
            editingLessonId === lesson.id ? (
              <LessonForm key={lesson.id} moduleId={mod.id} courseId={courseId} lesson={lesson}
                onDone={() => setEditingLessonId(null)} />
            ) : (
              <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} moduleId={mod.id}
                onEdit={() => setEditingLessonId(lesson.id)}
                onDelete={() => setLessons((p) => p.filter((l) => l.id !== lesson.id))} />
            )
          )}

          {addingLesson && (
            <LessonForm moduleId={mod.id} courseId={courseId} order={lessons.length}
              onDone={() => setAddingLesson(false)} />
          )}

          {!addingLesson && (
            <Button type="button" variant="ghost" size="sm" className="w-full gap-1.5 text-xs border border-dashed border-border/60 hover:border-primary/50"
              onClick={() => setAddingLesson(true)}>
              <Plus className="w-3.5 h-3.5" />{tl("addLesson")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main builder ─────────────────────────────────────────────────────────────

interface CourseBuilderProps {
  courseId: string;
  initialModules: ModuleData[];
}

export function CourseBuilder({ courseId, initialModules }: CourseBuilderProps) {
  const t = useTranslations("teacher.modules");
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [addingModule, setAddingModule] = useState(false);
  const [newModTitle, setNewModTitle] = useState("");
  const [newModDesc, setNewModDesc] = useState("");
  const [newModLevel, setNewModLevel] = useState<Level>("BEGINNER");
  const [saving, setSaving] = useState(false);

  async function addModule() {
    if (!newModTitle.trim()) return;
    setSaving(true);
    try {
      const mod = await createModule({
        courseId, title: newModTitle.trim(),
        description: newModDesc || undefined,
        level: newModLevel, order: modules.length,
      });
      setModules((p) => [...p, { ...mod, lessons: [] }]);
      setNewModTitle(""); setNewModDesc(""); setNewModLevel("BEGINNER");
      setAddingModule(false);
    } catch { toast.error("Failed to add module."); }
    setSaving(false);
  }

  async function handleDeleteModule(modId: string) {
    try {
      await deleteModule(modId, courseId);
      setModules((p) => p.filter((m) => m.id !== modId));
    } catch { toast.error("Failed to delete module."); }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{t("title")}</h2>
        <span className="text-xs text-muted-foreground">{t("dragHint")}</span>
      </div>

      {modules.length === 0 && !addingModule && (
        <p className="text-sm text-muted-foreground text-center py-8">{t("noModules")}</p>
      )}

      <div className="space-y-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id} mod={mod} courseId={courseId}
            onUpdate={(updated) => setModules((p) => p.map((m) => m.id === mod.id ? updated : m))}
            onDelete={() => handleDeleteModule(mod.id)}
          />
        ))}
      </div>

      {/* Add module form */}
      {addingModule ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/3 p-4 space-y-3">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input value={newModTitle} onChange={(e) => setNewModTitle(e.target.value)}
              placeholder={t("moduleTitlePlaceholder")} className="h-9 text-sm" autoFocus />
            <Select value={newModLevel} onValueChange={(v) => setNewModLevel(v as Level)}>
              <SelectTrigger className="h-9 w-35 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as Level[]).map((l) => (
                  <SelectItem key={l} value={l} className="text-xs">{t(`levels.${l}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input value={newModDesc} onChange={(e) => setNewModDesc(e.target.value)}
            placeholder={t("moduleDescPlaceholder")} className="h-9 text-sm" />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddingModule(false)}>
              <X className="w-3.5 h-3.5 me-1" />{t("cancel")}
            </Button>
            <Button type="button" size="sm" onClick={addModule} disabled={saving || !newModTitle.trim()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin me-1" /> : <Plus className="w-3.5 h-3.5 me-1" />}
              {t("save")}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" className="w-full gap-2 border-dashed" onClick={() => setAddingModule(true)}>
          <Plus className="w-4 h-4" />{t("addModule")}
        </Button>
      )}
    </div>
  );
}