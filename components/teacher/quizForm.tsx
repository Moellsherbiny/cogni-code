"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQuizAction } from "@/actions/teacher/quiz";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function QuizForm({ courseId, locale }: { courseId: string; locale: string }) {
  const t = useTranslations("QuizForm");
  const [isPending, startTransition] = useTransition();

  async function handleAction(formData: FormData) {
    formData.append("courseId", courseId);
    formData.append("language", locale);

    startTransition(async () => {
      const result = await generateQuizAction(formData);
      if (result.success) {
        toast.success(t("success"));
      } else {
        toast.error(t("error"));
      }
    });
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <form action={handleAction}>
        <CardContent className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">{t("topicLabel")}</Label>
            <Input 
              id="topic" 
              name="topic" 
              placeholder={t("topicPlaceholder")} 
              className="h-11"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="count">{t("countLabel")}</Label>
              <Input 
                id="count" 
                name="count" 
                type="number" 
                defaultValue={5} 
                min={1} 
                max={20} 
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label>{t("difficultyLabel")}</Label>
              <Select name="difficulty" defaultValue="INTERMEDIATE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">{t("easy")}</SelectItem>
                  <SelectItem value="INTERMEDIATE">{t("medium")}</SelectItem>
                  <SelectItem value="ADVANCED">{t("hard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            disabled={isPending} 
            className="w-full h-12 font-bold transition-all hover:scale-[1.01]"
          >
            {isPending ? (
              <><Loader2 className="animate-spin me-2" /> {t("generating")}</>
            ) : (
              t("submitBtn")
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}