"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TTSStatus = "idle" | "speaking" | "paused";

export function useTTS(locale: string) {
  const [status, setStatus] = useState<TTSStatus>("idle");
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const queueRef = useRef<string[]>([]);
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Map locale to BCP-47 lang
  const lang = locale === "ar" ? "ar-SA" : "en-US";

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    setStatus("idle");
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");
      utterance.onpause = () => setStatus("paused");
      utterance.onresume = () => setStatus("speaking");

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, lang, rate, pitch]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setStatus("speaking");
  }, [isSupported]);

  // Speak chunked (long text split by sentences)
  const speakLong = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;
      window.speechSynthesis.cancel();

      // Split into sentence-sized chunks
      const chunks = text.match(/[^.!?]+[.!?]+/g) ?? [text];
      let i = 0;

      const speakNext = () => {
        if (i >= chunks.length) {
          setStatus("idle");
          return;
        }
        const utterance = new SpeechSynthesisUtterance(chunks[i].trim());
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitch;

        if (i === 0) utterance.onstart = () => setStatus("speaking");
        utterance.onend = () => {
          i++;
          speakNext();
        };
        utterance.onerror = () => setStatus("idle");
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      speakNext();
    },
    [isSupported, lang, rate, pitch]
  );

  // Cancel on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    speak,
    speakLong,
    stop,
    pause,
    resume,
    status,
    rate,
    setRate,
    pitch,
    setPitch,
    isSupported,
  };
}