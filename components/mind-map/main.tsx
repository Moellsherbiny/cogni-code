"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import "./map.css";
interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}

interface MindMapProps {
  data: MindMapNode;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  className?: string;
}

function toMarkdown(node: MindMapNode, depth = 1): string {
  let md = `${"#".repeat(depth)} ${node.title}\n`;

  node.children?.forEach((child) => {
    md += toMarkdown(child, depth + 1);
  });

  return md;
}

export default function MindMap({
  data,
  svgRef,
  className = "w-full h-137.5",
}: MindMapProps) {
  const localRef = useRef<SVGSVGElement>(null);
  const activeRef = svgRef ?? localRef;

  const markmapRef = useRef<any>(null);

  useEffect(() => {
    const svg = activeRef.current;
    if (!svg || !data) return;

    svg.innerHTML = "";

    const transformer = new Transformer();
    const { root } = transformer.transform(toMarkdown(data));

    let frame = requestAnimationFrame(() => {
      if (!svg) return;

      markmapRef.current = Markmap.create(
        svg,
        {
          autoFit: true,
          zoom: true,
          pan: true,
          duration: 300,
          maxWidth: 320,
          spacingHorizontal: 80,
          spacingVertical: 10,
          paddingX: 16,
        },
        root
      );
    });

    const resizeObserver = new ResizeObserver(() => {
      markmapRef.current?.fit?.();
    });

    resizeObserver.observe(svg);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();

      try {
        markmapRef.current?.destroy?.();
      } catch {}

      markmapRef.current = null;
      svg.innerHTML = "";
    };
  }, [data, activeRef]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <svg
        ref={activeRef}
        className={className}
        style={{
          width: "100%",
          display: "block",
          cursor: "grab",
        }}
      />
    </div>
  );
}