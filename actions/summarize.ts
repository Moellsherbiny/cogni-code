"use server";

import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown error";

  // Rate limit / quota
  if (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("quota")
  ) {
    return "AI service is busy right now. Please wait a minute and try again.";
  }

  // Auth
  if (message.includes("Unauthorized")) {
    return "You must sign in first.";
  }

  return "Something went wrong while generating content. Please try again.";
}

async function callGemini(prompt: string) {
  try {
    const response =
      await genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents: [prompt],
      });

    return response.text || "";
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────

export async function generateSummaryAction(
  input: string
) {
  try {
    const user = await auth();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!input?.trim()) {
      return {
        success: false,
        message: "Please enter text first.",
      };
    }

    // Generate summary
    const summary = await callGemini(
      `Summarize this clearly:\n\n${input}`
    );

    // Generate mindmap
    const mindmapRaw = await callGemini(`
Convert this summary into valid JSON mindmap.

Summary:
${summary}

ONLY RETURN JSON:

{
  "title": "Main Topic",
  "children": [
    {
      "title": "Child",
      "children": []
    }
  ]
}
`);

    let mindmap;

    try {
      mindmap = JSON.parse(mindmapRaw);
    } catch {
      mindmap = {
        title: "Mind Map",
        children: [],
      };
    }

    // Save DB
    const saved =
      await prisma.mindMapHistory.create({
        data: {
          input,
          summary,
          mindmap,
          userId: user.user.id,
        },
      });

    return {
      success: true,
      id: saved.id,
    };
  } catch (error) {
    console.error(
      "generateSummaryAction error:",
      error
    );

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function getHistoryAction() {
  try {
    const user = await auth();

    if (!user) {
      return [];
    }

    return await prisma.mindMapHistory.findMany({
      where: {
        userId: user.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error(
      "getHistoryAction error:",
      error
    );

    return [];
  }
}

export async function getSummaryById(id: string) {
  try {
    const user = await auth();

    if (!user) {
      return null;
    }

    return await prisma.mindMapHistory.findFirst({
      where: {
        id,
        userId: user.user.id,
      },
    });
  } catch (error) {
    console.error(
      "getSummaryById error:",
      error
    );

    return null;
  }
}