import { Code2 } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group transition-transform active:scale-95"
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary shadow-lg shadow-primary/25 group-hover:rotate-3 transition-transform">
        <Code2 size={24} className="text-primary-foreground stroke-[2.5]" />
      </div>
      <span className="font-bold text-2xl tracking-tight">
        Cogni<span className="text-primary">Code</span>
      </span>
    </Link>
  );
}

export default Logo;
