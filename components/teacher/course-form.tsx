"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { createCourse, updateCourse } from "@/actions/teacher/teacher";
import { cn } from "@/lib/utils";

type FormData = { title: string; description: string };

interface CourseFormProps {
  initialData?: { id: string; title: string; description?: string | null; thumbnail?: string | null };
  onSuccess: (courseId: string) => void;
}

export function CourseForm({ initialData, onSuccess }: CourseFormProps) {
  const t = useTranslations("teacher.courseForm");
  const tv = useTranslations("teacher.validation");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
    },
  });

  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail ?? null);

  const onSubmit = async (values: FormData) => {
    const payload = { ...values, thumbnail: thumbnail ?? undefined };
    try {
      if (initialData) {
        await updateCourse(initialData.id, payload);
        onSuccess(initialData.id);
      } else {
        const course = await createCourse(payload);
        onSuccess(course.id);
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("titleLabel")}
        </Label>
        <Input
          id="title"
          placeholder={t("titlePlaceholder")}
          className={cn("h-10", errors.title && "border-destructive")}
          {...register("title", {
            required: tv("titleRequired"),
            minLength: { value: 3, message: tv("titleMin") },
          })}
        />
        {errors.title && (
          <p className="text-xs text-destructive" role="alert">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("descLabel")}
        </Label>
        <Textarea
          id="description"
          placeholder={t("descPlaceholder")}
          rows={4}
          className="resize-none"
          {...register("description")}
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("thumbnailLabel")}
        </Label>
        <ThumbnailUploader value={thumbnail} onChange={setThumbnail} />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full h-10 font-semibold" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t("submitting")}</>
        ) : initialData ? t("submitEdit") : t("submit")}
      </Button>
    </form>
  );
}