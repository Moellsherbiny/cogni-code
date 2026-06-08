"use client";

import { useEffect } from "react";

export default function PrintScript() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return null;
}