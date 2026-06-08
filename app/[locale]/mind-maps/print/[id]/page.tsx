import { getSummaryById } from "@/actions/summarize";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MindMap from "@/components/mind-map/main";
import PrintScript from "@/components/print/PrintScript";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}
function isMindMapNode(value: unknown): value is MindMapNode {
  return typeof value === "object" && value !== null && "title" in value;
}
export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const locale = await getLocale();

  const data = await getSummaryById(id);

  if (!data) {
    notFound();
  }
  const mindmap = isMindMapNode(data.mindmap)
    ? data.mindmap
    : {
        title: "Mind Map",
        children: [],
      };
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="bg-white text-black min-h-screen"
    >
      {/* Cover */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center">
        <div className="max-w-2xl">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              🧠
            </div>
          </div>

          <h1 className="text-6xl font-bold tracking-tight">Mind Map Report</h1>

          <p className="text-xl text-muted-foreground mt-6">
            AI Generated Summary & Knowledge Structure
          </p>

          <div className="mt-12 text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </section>

      <div className="page-break" />

      {/* Summary */}
      <section className="max-w-5xl mx-auto px-10 py-16">
        <div className="mb-10">
          <h2 className="text-4xl font-bold">Executive Summary</h2>

          <div className="w-24 h-1 bg-primary mt-4 rounded-full" />
        </div>

        <article
          className="
      prose
      prose-lg
      max-w-none
      [&_p]:leading-[2.2]
      [&_p]:mb-6
    "
        >
          <Markdown>{data.summary}</Markdown>
        </article>
      </section>

      <div className="page-break" />

      {/* Mind Map */}
      <section className="max-w-6xl mx-auto px-10 py-16">
        <div className="mb-10">
          <h2 className="text-4xl font-bold">Mind Map</h2>

          <div className="w-24 h-1 bg-primary mt-4 rounded-full" />
        </div>

        <div className="border rounded-2xl p-8 bg-white shadow-sm">
          <MindMap data={mindmap}  />
        </div>
      </section>

      <PrintScript />
    </div>
  );
}
