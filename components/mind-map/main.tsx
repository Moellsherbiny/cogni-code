// components/mind-map/main.tsx
"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

interface MindMapProps {
  data: any;
  // Add the ref prop here
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function toMarkdown(node: any, d = 1): string {
  let md = `${"#".repeat(d)} ${node.title}\n`;
  node.children?.forEach((c: any) => {
    md += toMarkdown(c, d + 1);
  });
  return md;
}

export default function MindMap({ data, svgRef }: MindMapProps) {
  // Use the passed ref or a local one if none provided
  const internalRef = useRef<SVGSVGElement>(null);
  const activeRef = svgRef || internalRef;

  useEffect(() => {
    if (!activeRef.current) return;
    activeRef.current.innerHTML = "";

    const t = new Transformer();
    const { root } = t.transform(toMarkdown(data));

    setTimeout(() => {
      if (activeRef.current) {
        Markmap.create(activeRef.current, {}, root);
      }
    }, 200);
  }, [data, activeRef]);

  return <svg ref={activeRef} className="w-full h-125" />;
}