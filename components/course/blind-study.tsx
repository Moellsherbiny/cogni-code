"use client";

import { useEffect, useState, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BlindStudyMode({ lesson, onNextLesson }: { lesson: any; onNextLesson: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Waiting for voice command...");

  // 1. Text to Speech (TTS)
  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Switch to "ar-SA" based on locale
    window.speechSynthesis.speak(utterance);
  }, []);

  // 2. Gemini AI Processing
  const processWithAI = async (userQuery: string) => {
    setStatus("Thinking...");
    const response = await fetch("/api/ai/study-assistant", {
      method: "POST",
      body: JSON.stringify({
        query: userQuery,
        context: lesson.content || lesson.transcript,
      }),
    });
    const data = await response.json();
    speak(data.answer);
    setStatus("Ready");
  };

  // 3. Speech to Text (STT)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support STT");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processWithAI(transcript);
    };

    recognition.start();
  };

  // Initial greeting
  useEffect(() => {
    if (lesson) {
      speak(`Entering blind mode. You are studying: ${lesson.title}. Tap anywhere to ask a question or say "Next" to continue.`);
    }
  }, [lesson, speak]);

  return (
    <div 
      className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-10 cursor-pointer"
      onClick={() => !isListening && startListening()}
    >
      <div className="text-center space-y-8">
        <div className={cn(
          "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500",
          isListening ? "bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "bg-primary"
        )}>
          {isListening ? <Mic className="w-20 h-20 animate-pulse" /> : <Volume2 className="w-20 h-20" />}
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{lesson?.title}</h1>
          <p className="text-xl text-slate-400">{status}</p>
          <p className="text-sm opacity-50 uppercase tracking-widest">
            {isListening ? "Listening..." : "Tap screen to speak"}
          </p>
        </div>
      </div>
    </div>
  );
}