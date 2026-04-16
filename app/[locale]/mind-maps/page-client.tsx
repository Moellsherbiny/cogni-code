"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { processContent } from "@/actions/summarize";
import { MindMap } from "@/components/mind-map/mind-map";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/navbar";

interface SummarizerClientProps {
  locale: string;
}

export function SummarizerClient({ locale }: SummarizerClientProps) {
  const t = useTranslations("mindMapsPage");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ summary: string; mindMap: any } | null>(null);
  const isRtl = locale === "ar";

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await processContent(formData, locale);
      if (response.success && response.data) {
        setResult({
          summary: response.data.summary,
          mindMap: response.data.mindMap,
        });
      } else {
        alert(response.error || "Something went wrong");
      }
    });
  }

  return (
    <main className="container mx-auto p-4 min-h-screen space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
        <Navbar />
      {/* Input Section */}
      <form action={handleSubmit} className="space-y-4 pt-24 max-w-4xl mx-auto">
        <Textarea
          name="content"
          required
          placeholder={t("placeholder")}
          className="min-h-37.5 text-lg p-4 shadow-inner"
          disabled={isPending}
        />
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
              {t("loading")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </form>

      {/* Results Section */}
      {result && (
        <div id="printable-content" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Card */}
          <Card className="h-fit">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">{t("summary")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {result.summary}
              </p>
            </CardContent>
          </Card>

          {/* Mind Map Card */}
          <Card className="h-fit">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">{t("mindMap")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 overflow-auto">
              <MindMap data={result.mindMap} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}