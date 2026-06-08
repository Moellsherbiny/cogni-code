"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodeEditor() {
  const [code, setCode] = useState(`console.log("Hello World");`);

  return (
    <div className="h-150 border rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: {
            enabled: true,
          },
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
}