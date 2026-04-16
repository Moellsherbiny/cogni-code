"use client";

import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function MindMapNode({ id, data }: any) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label);

  return (
    <Card
      className="
        rounded-xl 
        border 
        shadow-md 
        cursor-pointer 
        bg-white dark:bg-zinc-900 
        text-black dark:text-white
      "
      onDoubleClick={() => setEditing(true)}
    >
      <CardContent className="p-2 text-center">
        {editing ? (
          <Input
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              setEditing(false);
              data.onChange(id, value);
            }}
          />
        ) : (
          <p>{value}</p>
        )}
      </CardContent>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}