"use client";

import { generatePdf } from "@/actions/pdf";

export default function DownloadPdfButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        const pdf = await generatePdf(id);
        const blob = new Blob([pdf as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `summary-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }}
      className="bg-black text-white px-4 py-2"
    >
      Download PDF
    </button>
  );
}