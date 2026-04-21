import { getHistoryAction } from "@/actions/summarize";
import Link from "next/link";

export default async function Page() {
  const data = await getHistoryAction();

  return (
    <div className="p-6 space-y-4">
      {data.map((x) => (
        <Link key={x.id} href={`/mind-maps/result/${x.id}`}>
          <div className="border p-3 hover:bg-gray-100">
            {x.input.slice(0, 100)}
          </div>
        </Link>
      ))}
    </div>
  );
}