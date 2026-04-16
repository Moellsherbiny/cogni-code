"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/actions/upload-image";
import { uploadToCloudinary } from "@/actions/cloudinary";

interface ThumbnailUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ThumbnailUploader({ value, onChange, className }: ThumbnailUploaderProps) {
  const t = useTranslations("teacher.courseForm");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("typeError"));
      return;
    }
    // 1mb image
    if (file.size > 1 * 1024 * 1024) {
      toast.error(t("sizeError"));
      return;
    }

    setUploading(true);
    try {
      
      const result = await uploadToCloudinary(file);
      if (result) {
        onChange(result);
      } else {
        toast.error(t("uploadError"));
      }
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setUploading(false);
      // reset so the same file can be re-selected
      e.target.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border/60 aspect-video bg-muted">
          <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-white hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full aspect-video rounded-xl border-2 border-dashed border-border/60 bg-muted/40",
            "flex flex-col items-center justify-center gap-2",
            "hover:border-primary/50 hover:bg-muted/70 transition-colors",
            uploading && "opacity-60 pointer-events-none"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("uploading")}</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">{t("thumbnailLabel")}</span>
              <span className="text-[11px] text-muted-foreground/60">{t("thumbnailHint")}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}