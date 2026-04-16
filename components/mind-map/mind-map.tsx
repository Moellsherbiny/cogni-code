"use client"

import React from 'react';

interface Node {
  label: string;
  children?: Node[];
}

export function MindMap({ data }: { data: Node }) {
  return (
    <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
      <div className="font-bold text-lg mb-2 text-primary">{data.label}</div>
      {data.children && data.children.length > 0 && (
        <ul className="ltr:ml-6 rtl:mr-6 border-l rtl:border-l-0 rtl:border-r border-muted-foreground/30 space-y-2 mt-2">
          {data.children.map((child, index) => (
            <li key={index} className="relative ltr:pl-4 rtl:pr-4">
              <MindMap data={child} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}