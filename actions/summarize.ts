"use server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import {auth} from "@/auth"
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


async function callGemini(prompt: string) {
  const response = await genAI.models.generateContent({
    contents: [prompt],
    model: "gemini-flash-latest",
  });
  return response.text || "";
}

export async function generateSummaryAction(input: string) {
  const user = await auth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const summary = await callGemini(`Summarize:\n${input}`);

  const mindmapRaw = await callGemini(`
Convert into JSON mindmap:
${summary}

ONLY JSON:
{
 "title": "",
 "children": []
}`);

  let mindmap;
  try {
    mindmap = JSON.parse(mindmapRaw);
  } catch {
    mindmap = { title: "Error", children: [] };
  }

  const saved = await prisma.mindMapHistory.create({
    data: { input, summary, mindmap, userId: user.user.id },
  });

  return saved.id;
}

export async function getHistoryAction() {
  const user = await auth();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return prisma.mindMapHistory.findMany({
    orderBy: { createdAt: "desc" },
    where: { userId: user.user.id },
  });
}

export async function getSummaryById(id: string) {
  const user = await auth();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return prisma.mindMapHistory.findUnique({ where: { id, userId: user.user.id } });
}
