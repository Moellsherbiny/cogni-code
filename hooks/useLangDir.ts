"use client";

import { useEffect } from "react";

const getLangFromCookie = (): "en" | "ar" => {
  if (typeof document === "undefined") return "en";

  const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
  return match?.[1] === "ar" ? "ar" : "en";
};

export const useLanguageDirection = () => {
  useEffect(() => {
    const updateDirection = () => {
      const lang = getLangFromCookie();

      if (lang === "ar") {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
      } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = "en";
      }
    };

    updateDirection();

    const interval = setInterval(updateDirection, 800);
    return () => clearInterval(interval);
  }, []);
};