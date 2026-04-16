"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlacementTestIntro } from "./intro";
import { PlacementTestQuiz } from "./quiz";
import { PlacementTestResult } from "./results";
import { startPlacementTest, submitPlacementTest, Question } from "@/actions/placement-test";

type TestResult = {
  score: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  recommended: string;
  aiFeedback: string;
  fieldScores: Record<string, { correct: number; total: number }>;
  difficultyResults: Record<
    string,
    { correct: number; total: number }
  >;
};

type Props = {
  userId: string;
  existingTest: {
    id: string;
    score: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    recommended: string;
    aiFeedback: string;
  } | null;
};

type Phase = "intro" | "quiz" | "result";

export function PlacementTestClient({ userId, existingTest }: Props) {
  const [phase, setPhase] = useState<Phase>(
    existingTest ? "result" : "intro"
  );
  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<TestResult | null>(
    existingTest
      ? {
          score: existingTest.score,
          level: existingTest.level,
          recommended: existingTest.recommended,
          aiFeedback: existingTest.aiFeedback,
          fieldScores: {},
          difficultyResults: {},
        }
      : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const { testId: id, questions: qs } = await startPlacementTest(userId);
      setTestId(id);
      setQuestions(qs);
      setPhase("quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (answers: Record<string, string>) => {
    if (!testId) return;
    setIsLoading(true);
    try {
      const res = await submitPlacementTest({ testId, answers });
      setResult(res);
      setPhase("result");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = async () => {
    setResult(null);
    setTestId(null);
    setQuestions([]);
    setPhase("intro");
  };

  if (phase === "intro") {
    return (
      <PlacementTestIntro onStart={handleStart} isLoading={isLoading} />
    );
  }

  if (phase === "quiz") {
    return (
      <PlacementTestQuiz
        questions={questions}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    );
  }

  if (phase === "result" && result) {
    return (
      <PlacementTestResult result={result} onRetake={handleRetake} />
    );
  }

  return null;
}