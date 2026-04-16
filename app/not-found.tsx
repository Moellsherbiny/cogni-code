"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-background transition-colors duration-300 overflow-hidden">

      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-100 dark:bg-indigo-950/60 opacity-70 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-100 dark:bg-violet-950/60 opacity-70 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-xl px-8 py-14 flex flex-col items-center text-center">

        {/* 404 number */}
        <span className="font-mono text-8xl sm:text-9xl font-black leading-none bg-linear-to-br from-[#0091ff] to-[#887fff] bg-clip-text text-transparent select-none">
          404
        </span>

        <Separator className="my-6 w-16 bg-linear-to-r from-indigo-400 to-violet-400" />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Double-check the URL or head back home.
        </p>

        {/* Status badge */}
        <Badge
          variant="outline"
          className="mt-6 gap-2 rounded-full px-4 py-4 text-xs font-mono tracking-widest uppercase text-muted-foreground border-border"
        >
          <AlertCircle className="w-3 h-3 text-red-400" aria-hidden />
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Error · 404 Not Found
        </Badge>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            asChild
            className="w-full sm:w-auto gap-2 bg-gradient-main  text-white rounded-xl h-11 px-6 font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 rounded-xl h-11 px-6 font-semibold border-border hover:cursor-pointer "
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-muted-foreground">
        If you think this is a mistake,{" "}
        <a
          href="mailto:support@example.com"
          className="underline underline-offset-2 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          contact support
        </a>
        .
      </p>
    </main>
  );
}