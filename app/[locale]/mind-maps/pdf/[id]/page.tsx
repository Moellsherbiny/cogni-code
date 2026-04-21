import { getSummaryById } from "@/actions/summarize";
import dynamic from "next/dynamic";
import MindMap from "@/components/mind-map/main";
import Markdown from "react-markdown";
import { isArabic } from "@/lib/isRTL";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const data = await getSummaryById((await params).id);
  if (!data) return null;

  return (
    <div className="p-10 bg-white text-black space-y-6">
      <h1 className="text-2xl font-bold">Summary Report</h1>

      <div dir={isArabic(data.summary) ? "rtl" : "ltr"} className="border p-4">
        <Markdown>
            {data.summary}
        </Markdown>
        </div>

      <div className="h-125">
        <MindMap data={data.mindmap} />
      </div>
    </div>
  );
}