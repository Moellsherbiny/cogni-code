"use client";

import { useEffect, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMindMapStore } from "@/store/useMindMapStore";
import { useTheme } from "next-themes"; // إذا كنت تستخدم next-themes مع shadcn

export function MapCanvas() {
  const { currentMap, onNodesChange, onEdgesChange } = useMindMapStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ننتظر حتى يتم تحميل المكون في المتصفح
  useEffect(() => {
    setMounted(true);
  }, []);

  // إذا لم يتم التحميل بعد، نعرض واجهة فارغة أو Loading
  if (!mounted) {
    return <div className="flex-1 h-full bg-slate-50 dark:bg-slate-950" />;
  }

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={currentMap?.nodes || []}
        edges={currentMap?.edges || []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        // نحدد اللون بناءً على الثيم الحالي من next-themes
        colorMode={theme === "dark" ? "dark" : "light"}
      >
        <Background gap={24} size={1} />
        <Controls className="fill-foreground bg-background border-muted shadow-xl" />
        <MiniMap className="dark:bg-slate-900 border rounded-lg overflow-hidden" />
      </ReactFlow>
    </div>
  );
}
