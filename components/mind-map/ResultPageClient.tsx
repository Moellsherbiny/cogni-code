"use client";

import { useRef, useState } from "react";
import MindMap from "@/components/mind-map/main";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Navbar from "@/components/layout/navbar";
import HistoryPanel from "@/components/mind-map/historyPanel";

import { downloadSummaryPdf } from "@/lib/downloadPdf";
import { isArabic } from "@/lib/isRTL";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Sparkles,
  Clock,
  Calendar,
  FileText,
  GitBranch,
  Download,
  Loader2,
} from "lucide-react";

interface Props {
  id: string;
  summary: string;
  mindmap: any;
  locale: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractTitle(summary: string) {
  const firstLine =
    summary.split("\n").find((line) => line.trim()) || "Summary";

  return firstLine.replace(/^#+\s*/, "").slice(0, 70);
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ResultPageClient({
  id,
  summary,
  mindmap,
  locale,
}: Props) {
  const tr = useTranslations("result");

  const isRTL = locale === "ar";

  const summaryRef = useRef<HTMLDivElement>(null);
  const mindmapSvgRef = useRef<SVGSVGElement>(null);

  const [activeTab, setActiveTab] =
    useState<"summary" | "mindmap">("summary");

  const [downloading, setDownloading] = useState(false);

  const readTime = estimateReadingTime(summary);

  const today = new Date().toLocaleDateString(
    isRTL ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  // ─────────────────────────────────────────────
  // Download PDF
  // ─────────────────────────────────────────────

  async function handleDownload() {
    if (!summaryRef.current || !mindmapSvgRef.current) return;

    const wasSummary = activeTab === "summary";

    try {
      setDownloading(true);

      if (wasSummary) {
        setActiveTab("mindmap");

        await new Promise((resolve) =>
          setTimeout(resolve, 600)
        );
      }

      await downloadSummaryPdf({
        summaryEl: summaryRef.current,
        mindmapSvg: mindmapSvgRef.current,
        title: extractTitle(summary),
        isRTL,
      });
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      if (wasSummary) {
        setActiveTab("summary");
      }

      setDownloading(false);
    }
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground flex flex-col"
    >
      {/* top accent */}
      <div className="h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />

      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 py-20 md:py-24 flex-1 space-y-8">
        <HistoryPanel
          locale={locale}
          isRTL={isRTL}
        />

        {/* Header */}
        <section className="space-y-4">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full px-3 py-1 text-xs"
          >
            <Sparkles className="h-3 w-3" />
            {tr("pageTitle")}
          </Badge>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {tr("pageSubtitle")}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readTime} {tr("readingTime")}
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {tr("generatedOn")} {today}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
              className="ms-auto h-8 gap-1.5 px-3 text-xs"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {tr("downloading")}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  {tr("downloadPdf")}
                </>
              )}
            </Button>
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "summary" | "mindmap")
          }
          className="space-y-6"
        >
          <TabsList className="h-10 rounded-lg bg-muted/60 p-1">
            <TabsTrigger
              value="summary"
              className="gap-1.5 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              {tr("summaryLabel")}
            </TabsTrigger>

            <TabsTrigger
              value="mindmap"
              className="gap-1.5 text-xs"
            >
              <GitBranch className="h-3.5 w-3.5" />
              {tr("mindmapLabel")}
            </TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent
            value="summary"
            forceMount
            className="mt-0"
          >
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b px-5 py-3">
                <FileText className="h-4 w-4 text-muted-foreground" />

                <span className="text-xs font-medium text-muted-foreground">
                  {tr("summaryLabel")}
                </span>
              </div>

              <div
                ref={summaryRef}
                dir={isArabic(summary) ? "rtl" : "ltr"}
                className={cn(
                  "px-5 py-6 prose prose-sm dark:prose-invert max-w-none",
                  "prose-headings:font-semibold",
                  "prose-p:text-foreground/80 prose-p:leading-relaxed",
                  "prose-li:text-foreground/80",
                  isRTL && "text-right"
                )}
              >
                <Markdown
                  remarkPlugins={[
                    [remarkGfm, { singleTilde: false }],
                  ]}
                  components={{
                    code(props) {
                      const {
                        children,
                        className,
                        ref,
                        ...rest
                      } = props;

                      const match =
                        /language-(\w+)/.exec(
                          className || ""
                        );

                      return match ? (
                        <SyntaxHighlighter
                          PreTag="div"
                          language={match[1]}
                          style={docco as any}
                          
                          {...rest}
                        >
                          {String(children).replace(
                            /\n$/,
                            ""
                          )}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className={className}
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {summary}
                </Markdown>
              </div>
            </div>
          </TabsContent>

          {/* Mindmap */}
          <TabsContent
            value="mindmap"
            forceMount
            className="mt-0"
          >
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b px-5 py-3">
                <GitBranch className="h-4 w-4 text-muted-foreground" />

                <span className="text-xs font-medium text-muted-foreground">
                  {tr("mindmapLabel")}
                </span>

                <span className="ms-auto text-xs text-muted-foreground/50">
                  Scroll · Zoom · Drag
                </span>
              </div>

              <div className="bg-muted/20 p-2">
                <MindMap
                  data={mindmap}
                  svgRef={mindmapSvgRef}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4">
        <p className="text-center text-xs text-muted-foreground/40">
          Summarize AI · {today}
        </p>
      </footer>
    </div>
  );
}