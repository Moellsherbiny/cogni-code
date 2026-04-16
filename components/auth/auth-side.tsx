"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, BookOpen, Trophy, Users } from "lucide-react";
import Logo from "../layout/logo";
import Link from "next/link";

export default function AuthSide() {
  const t = useTranslations("auth");

  const features = [
    {
      icon: BookOpen,
      ...(t.raw("side.features.courses") as { title: string; desc: string }),
    },
    {
      icon: Trophy,
      ...(t.raw("side.features.progress") as { title: string; desc: string }),
    },
    {
      icon: Users,
      ...(t.raw("side.features.community") as { title: string; desc: string }),
    },
  ];

  return (
    <div className="hidden md:flex flex-col justify-between relative overflow-hidden bg-zinc-950 text-white p-12 select-none">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Glow blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-15 -right-15 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

      {/* Logo */}
        <Logo />
      

      {/* Hero text */}
      <div className="relative z-10 space-y-4">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-400">
          {t("side.tagline")}
        </p>
        <h2 className="text-4xl font-black leading-[1.1] tracking-tight">
          {t("side.headline1")}
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400">
            {t("side.headline2")}
          </span>
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
          {t("side.body")}
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 space-y-5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3.5">
            <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-white/8 ring-1 ring-white/12 shrink-0">
              <Icon className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">{title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
