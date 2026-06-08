"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Code, Code2, FileCode2, Play, Trash2 } from "lucide-react";
type TemplateType = "javascript" | "html" | "html-css" | "html-css-js";

type ConsoleMessage = {
  type: "log" | "error" | "warn";
  message: string;
};
export default function Playground() {
  const [template, setTemplate] = useState<TemplateType>("html");
  const [activeFile, setActiveFile] = useState<"html" | "css" | "js">("html");
  const [html, setHtml] = useState("<h1>Hello World</h1>");

  const [logs, setLogs] = useState<ConsoleMessage[]>([]);
  const [css, setCss] = useState(`
h1{
  color:green;
}
`);

  const [js, setJs] = useState(`
console.log("Hello World");
`);

  const preview = useMemo(() => {
    return `
<!DOCTYPE html>
<html>

<head>
<style>
${css}
</style>
</head>

<body>

${html}

<script>
${js}
<\/script>

</body>

</html>
`;
  }, [html, css, js]);

  const runJavaScript = () => {
    const output: ConsoleMessage[] = [];

    try {
      const fakeConsole = {
        log: (...args: unknown[]) => {
          output.push({
            type: "log",
            message: args.map(String).join(" "),
          });
        },

        warn: (...args: unknown[]) => {
          output.push({
            type: "warn",
            message: args.map(String).join(" "),
          });
        },

        error: (...args: unknown[]) => {
          output.push({
            type: "error",
            message: args.map(String).join(" "),
          });
        },
      };

      new Function("console", js)(fakeConsole);

      setLogs(output);
    } catch (error) {
      setLogs([
        {
          type: "error",
          message: error instanceof Error ? error.message : "Unknown Error",
        },
      ]);
    }
  };
  useEffect(() => {
    setActiveFile(template === "javascript" ? "js" : "html");
  }, [template]);

  useEffect(() => {
    localStorage.setItem(
      "playground-state",
      JSON.stringify({
        template,
        html,
        css,
        js,
      }),
    );
  }, [template, html, css, js]);

  useEffect(() => {
    const saved = localStorage.getItem("playground-state");

    if (!saved) return;

    const data = JSON.parse(saved);

    setTemplate(data.template ?? "html");

    setHtml(data.html ?? "");
    setCss(data.css ?? "");
    setJs(data.js ?? "");
  }, []);

  const showHtml = template !== "javascript";

  const showCss = template === "html-css" || template === "html-css-js";

  const showJs = template === "javascript" || template === "html-css-js";
  const [srcDoc, setSrcDoc] = useState(preview);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(preview);
    }, 300);

    return () => clearTimeout(timeout);
  }, [preview]);

  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };

    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur px-3 py-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          {/* Environment Selector */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <Label htmlFor="template" className="text-muted-foreground">
              Environment
            </Label>

            <Select
              value={template}
              onValueChange={(value) => setTemplate(value as TemplateType)}
            >
              <SelectTrigger id="template" className="w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="javascript">JavaScript Console</SelectItem>

                <SelectItem value="html">HTML</SelectItem>

                <SelectItem value="html-css">HTML + CSS</SelectItem>

                <SelectItem value="html-css-js">HTML + CSS + JS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          {template === "javascript" && (
            <div className="flex gap-2">
              <Button onClick={runJavaScript} className="flex-1 sm:flex-none">
                <Play className="mr-1 size-4" />
                Run
              </Button>

              <Button variant="outline" onClick={() => setLogs([])}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <ResizablePanelGroup
          orientation={isMobile ? "vertical" : "horizontal"}
          className="h-full"
        >
          <ResizablePanel
            defaultSize={isMobile ? "60%" : "50%"}
            className="overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className="border-b bg-muted/30 px-2 py-1">
                <Tabs
                  value={activeFile}
                  onValueChange={(value) =>
                    setActiveFile(value as "html" | "css" | "js")
                  }
                >
                  <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
                    {showHtml && (
                      <TabsTrigger value="html">
                        <FileCode2 className="mr-1 size-3.5" />
                        index.html
                      </TabsTrigger>
                    )}

                    {showCss && (
                      <TabsTrigger value="css">
                        <FileCode2 className="mr-1 size-3.5" />
                        styles.css
                      </TabsTrigger>
                    )}

                    {showJs && (
                      <TabsTrigger value="js">
                        <Code className="mr-1 size-3.5" />
                        script.js
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
              </div>

              {/* Monaco هنا */}
              <Editor
                height="100%"
                theme="vs-dark"
                language={
                  activeFile === "html"
                    ? "html"
                    : activeFile === "css"
                      ? "css"
                      : "javascript"
                }
                value={
                  activeFile === "html" ? html : activeFile === "css" ? css : js
                }
                onChange={(value) => {
                  const content = value || "";

                  if (activeFile === "html") {
                    setHtml(content);
                  }

                  if (activeFile === "css") {
                    setCss(content);
                  }

                  if (activeFile === "js") {
                    setJs(content);
                  }
                }}
                options={{
                  minimap: {
                    enabled: false,
                  },

                  glyphMargin: false,
                  folding: false,
                  lineNumbersMinChars: 2,
                  scrollBeyondLastLine: false,
                  contextmenu: false,
                  wordWrap: "on",

                  fontSize: isMobile ? 12 : 14,

                  automaticLayout: true,
                }}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={isMobile ? "40%" : "50%"}
            className="overflow-hidden"
          >
            {template === "javascript" ? (
              <div className="h-full flex flex-col">
                <div className="border-b px-3 py-2 font-medium bg-background">
                  Console
                </div>

                <div className="flex-1 bg-black p-4 overflow-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground">No Output</div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`mb-1 ${
                          log.type === "error"
                            ? "text-red-500"
                            : log.type === "warn"
                              ? "text-yellow-500"
                              : "text-green-400"
                        }`}
                      >
                        <span className="mr-2 font-semibold">
                          [{log.type.toUpperCase()}]
                        </span>

                        {log.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <iframe
                srcDoc={srcDoc}
                className="w-full h-full border-0 bg-white"
                title="preview"
              />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
