import { getSummaryById } from "@/actions/summarize";
import ResultPageClient from "@/components/mind-map/ResultPageClient";
import { getLocale } from "next-intl/server";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const data = await getSummaryById(id);
  const locale = await getLocale();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-4xl">🔍</p>
          <p className="text-lg font-medium text-foreground">Not Found</p>
          <p className="text-sm text-muted-foreground">The requested summary was not found.</p>
        </div>
      </div>
    );
  }

  return (
    <ResultPageClient
      id={id}
      summary={data.summary}
      mindmap={data.mindmap}
      locale={locale}
    />
  );
}