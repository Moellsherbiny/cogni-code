"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export default function DirectionProvider() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}