"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// --- MANUAL TYPE DEFINITIONS (Fixes the 'Cannot find name' errors) ---
// We define these locally so TS doesn't have to rely on external type discovery.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: any) => any) | null;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
// --- END MANUAL TYPE DEFINITIONS ---

export type STTStatus = "idle" | "listening" | "processing" | "error";

interface UseSTTOptions {
  locale: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSTT({ locale, onResult, onError }: UseSTTOptions) {
  const [status, setStatus] = useState<STTStatus>("idle");
  const [transcript, setTranscript] = useState("");
  // Use the interface we defined above
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const lang = locale === "ar" ? "ar-SA" : "en-US";

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported =
      !!window.SpeechRecognition || !!window.webkitSpeechRecognition;

    setIsSupported(supported);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      onError?.("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const Constructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) return;

    const recognition = new Constructor();
    recognitionRef.current = recognition;

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("listening");
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setStatus("processing");
      onResult?.(result);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return;
      setStatus("error");
      onError?.(event.error);
      setTimeout(() => setStatus("idle"), 2000);
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    try {
      recognition.start();
    } catch (err) {
      setStatus("error");
    }
  }, [isSupported, lang, onResult, onError]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { start, stop, status, transcript, isSupported };
}
