"use client";

import { useRef, useState, useCallback } from "react";
import MindMap from "@/components/mind-map/main";
import Markdown from "react-markdown";
import { useTheme } from "next-themes";
import { downloadSummaryPdf } from "@/lib/downloadPdf";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryPanel from "@/components/mind-map/historyPanel";
import { cn } from "@/lib/utils";
import {
  FileText,
  GitBranch,
  Clock,
  Calendar,
  Sparkles,
  Download,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Navbar from "../layout/navbar";
import { isArabic } from "@/lib/isRTL";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'


interface Props {
  id: string;
  summary: string;
  mindmap: any;
  locale: string;
}

function estimateReadingTime(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function extractTitle(summary: string): string {
  const first = summary.split("\n").find((l) => l.trim().length > 0) ?? "";
  return first.replace(/^#+\s*/, "").slice(0, 70) || "Summary";
}

export default function ResultPageClient({
  id,
  summary,
  mindmap,
  locale,
}: Props) {
  const isRTL = locale === "ar";
  const { theme, setTheme } = useTheme();
  const tr = useTranslations("result");
  const summaryRef = useRef<HTMLDivElement>(null);
  const mindmapSvgRef = useRef<SVGSVGElement | null>(null);

  const [activeTab, setActiveTab] = useState("summary");
  const [downloading, setDownloading] = useState(false);

  const readMins = estimateReadingTime(summary);
  const today = new Date().toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  const handleSvgRef = useCallback((el: SVGSVGElement | null) => {
    mindmapSvgRef.current = el;
  }, []);

const handleDownload = async () => {
  // 1. Initial Check
  if (!summaryRef.current || !mindmapSvgRef.current) {
    console.error("Refs not ready", { 
      summary: !!summaryRef.current, 
      mindmap: !!mindmapSvgRef.current 
    });
    return;
  }

  setDownloading(true);
  const wasOnSummary = activeTab === "summary";

  try {
    // 2. If on Summary, switch to Mindmap to ensure the SVG is "awake"
    if (wasOnSummary) {
      setActiveTab("mindmap");
      // Small delay to allow Markmap to adjust to visibility
      await new Promise((r) => setTimeout(r, 500));
    }

    // 3. Final Check + Capture
    const summaryEl = summaryRef.current;
    const mindmapSvg = mindmapSvgRef.current;

    if (!summaryEl || !mindmapSvg) throw new Error("Elements disappeared during tab switch");

    await downloadSummaryPdf({
      summaryEl,
      mindmapSvg,
      title: extractTitle(summary),
      isRTL,
    });

  } catch (err) {
    console.error("Download Error:", err);
  } finally {
    if (wasOnSummary) setActiveTab("summary");
    setDownloading(false);
  }
};
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col"
    >
      {/* Top accent */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/60 to-transparent" />

      <Navbar />
      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-2xl md:max-w-7xl flex-1 px-6 py-20 md:py-24 space-y-8">
        <HistoryPanel locale={locale} isRTL={isRTL} />
        <div className="space-y-4">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <Sparkles className="h-3 w-3" />
            {tr("pageTitle")}
          </Badge>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {tr("pageSubtitle")}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readMins} {tr("readingTime")}
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
              className={cn(
                "ms-auto h-8 gap-1.5 px-3 text-xs font-medium",
                "border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                "transition-all duration-200",
              )}
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
        </div>

        <Separator className="opacity-50" />

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="h-9 rounded-lg bg-muted/60 p-1">
            <TabsTrigger
              value="summary"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              {tr("summaryLabel")}
            </TabsTrigger>
            <TabsTrigger
              value="mindmap"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <GitBranch className="h-3.5 w-3.5" />
              {tr("mindmapLabel")}
            </TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent
            value="summary"
            forceMount
            className="mt-0 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {tr("summaryLabel")}
                </span>
              </div>
              <div
                ref={summaryRef}
                dir={isArabic(summary) ? "rtl" : "ltr"}
                className={cn(
                  "px-5 py-6",
                  "prose prose-sm dark:prose-invert max-w-none",
                  "prose-headings:font-semibold prose-headings:tracking-tight",
                  "prose-p:leading-relaxed prose-p:text-foreground/80",
                  "prose-li:text-foreground/80",
                  "prose-strong:text-foreground prose-strong:font-semibold",
                  "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs",
                  "prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground",
                  isRTL && "text-right",
                )}
              >
                <Markdown
                  children={summary}
                  remarkPlugins={[[remarkGfm, {singleTilde: false}]]}
                  components={{
                    code(props) {
                      const { children, className, node, ref, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          {...rest}
                          PreTag="div"
                          children={String(children).replace(/\n$/, "")}
                          language={match[1]}
                          style={dark}
                        />
                      ) : (
                        <code {...rest} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Mind Map */}
          <TabsContent
            value="mindmap"
            forceMount
            className="mt-0 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {tr("mindmapLabel")}
                </span>
                <span className="ms-auto text-xs text-muted-foreground/50">
                  Scroll · Zoom · Drag
                </span>
              </div>
              <div className="bg-muted/20 p-2">
                <MindMap data={mindmap} svgRef={mindmapSvgRef} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/60 py-4">
        <p className="text-center text-xs text-muted-foreground/40">
          Summarize AI · {today}
        </p>
      </footer>
    </div>
  );
}
