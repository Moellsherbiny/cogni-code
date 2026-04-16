"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export type Question = {
  id: string;
  text: string;
  textAr: string;
  options: { id: string; text: string; textAr: string }[];
  correctOptionId: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  field: string;
};

const QUESTION_BANK: Question[] = [
  {
    // ── BEGINNER ──────────────────────────────────────────────────────────────
    id: "q1",
    text: "What does HTML stand for?",
    textAr: "ماذا تعني اختصار HTML؟",
    options: [
      {
        id: "a",
        text: "HyperText Markup Language",
        textAr: "لغة ترميز النص التشعبي",
      },
      {
        id: "b",
        text: "High Transfer Markup Language",
        textAr: "لغة ترميز النقل العالي",
      },
      {
        id: "c",
        text: "HyperText Modern Language",
        textAr: "لغة النص التشعبي الحديثة",
      },
      {
        id: "d",
        text: "Home Tool Markup Language",
        textAr: "لغة ترميز أدوات المنزل",
      },
    ],
    correctOptionId: "a",
    difficulty: "BEGINNER",
    field: "Web Development",
  },
  {
    id: "q2",
    text: "Which of the following is a programming language?",
    textAr: "أي من التالية تُعدّ لغة برمجة؟",
    options: [
      { id: "a", text: "HTML", textAr: "HTML" },
      { id: "b", text: "CSS", textAr: "CSS" },
      { id: "c", text: "Python", textAr: "Python" },
      { id: "d", text: "HTTP", textAr: "HTTP" },
    ],
    correctOptionId: "c",
    difficulty: "BEGINNER",
    field: "Programming",
  },
  {
    id: "q3",
    text: "What is a database?",
    textAr: "ما هي قاعدة البيانات؟",
    options: [
      {
        id: "a",
        text: "A type of computer hardware",
        textAr: "نوع من أجهزة الحاسوب",
      },
      {
        id: "b",
        text: "An organized collection of structured data",
        textAr: "مجموعة منظمة من البيانات المهيكلة",
      },
      { id: "c", text: "A programming language", textAr: "لغة برمجة" },
      { id: "d", text: "A network protocol", textAr: "بروتوكول شبكة" },
    ],
    correctOptionId: "b",
    difficulty: "BEGINNER",
    field: "Data",
  },
  {
    id: "q4",
    text: "What does CSS stand for?",
    textAr: "ماذا يعني اختصار CSS؟",
    options: [
      {
        id: "a",
        text: "Cascading Style Sheets",
        textAr: "أوراق الأنماط المتتالية",
      },
      {
        id: "b",
        text: "Creative Style System",
        textAr: "نظام الأنماط الإبداعية",
      },
      { id: "c", text: "Computer Style Sheets", textAr: "أوراق أنماط الحاسوب" },
      {
        id: "d",
        text: "Colorful Style Sheets",
        textAr: "أوراق الأنماط الملونة",
      },
    ],
    correctOptionId: "a",
    difficulty: "BEGINNER",
    field: "Web Development",
  },
  {
    id: "q5",
    text: "Which symbol is used for single-line comments in Python?",
    textAr: "أي رمز يُستخدم للتعليقات أحادية السطر في Python؟",
    options: [
      { id: "a", text: "//", textAr: "//" },
      { id: "b", text: "/* */", textAr: "/* */" },
      { id: "c", text: "#", textAr: "#" },
      { id: "d", text: "--", textAr: "--" },
    ],
    correctOptionId: "c",
    difficulty: "BEGINNER",
    field: "Programming",
  },

  // ── INTERMEDIATE ──────────────────────────────────────────────────────────
  {
    id: "q6",
    text: "What is the time complexity of binary search?",
    textAr: "ما هو تعقيد وقت البحث الثنائي؟",
    options: [
      { id: "a", text: "O(n)", textAr: "O(n)" },
      { id: "b", text: "O(n²)", textAr: "O(n²)" },
      { id: "c", text: "O(log n)", textAr: "O(log n)" },
      { id: "d", text: "O(1)", textAr: "O(1)" },
    ],
    correctOptionId: "c",
    difficulty: "INTERMEDIATE",
    field: "Algorithms",
  },
  {
    id: "q7",
    text: "Which HTTP method is typically used to update a resource?",
    textAr: "أي طريقة HTTP تُستخدم عادةً لتحديث مورد؟",
    options: [
      { id: "a", text: "GET", textAr: "GET" },
      { id: "b", text: "POST", textAr: "POST" },
      { id: "c", text: "PUT", textAr: "PUT" },
      { id: "d", text: "DELETE", textAr: "DELETE" },
    ],
    correctOptionId: "c",
    difficulty: "INTERMEDIATE",
    field: "Web Development",
  },
  {
    id: "q8",
    text: "What is the purpose of normalization in databases?",
    textAr: "ما الغرض من التطبيع في قواعد البيانات؟",
    options: [
      {
        id: "a",
        text: "To increase data redundancy",
        textAr: "لزيادة تكرار البيانات",
      },
      {
        id: "b",
        text: "To reduce data redundancy and improve integrity",
        textAr: "لتقليل تكرار البيانات وتحسين النزاهة",
      },
      { id: "c", text: "To encrypt data", textAr: "لتشفير البيانات" },
      {
        id: "d",
        text: "To compress data storage",
        textAr: "لضغط تخزين البيانات",
      },
    ],
    correctOptionId: "b",
    difficulty: "INTERMEDIATE",
    field: "Data",
  },
  {
    id: "q9",
    text: "In React, what hook is used to manage side effects?",
    textAr: "في React، ما الـ hook المستخدم لإدارة الآثار الجانبية؟",
    options: [
      { id: "a", text: "useState", textAr: "useState" },
      { id: "b", text: "useRef", textAr: "useRef" },
      { id: "c", text: "useEffect", textAr: "useEffect" },
      { id: "d", text: "useContext", textAr: "useContext" },
    ],
    correctOptionId: "c",
    difficulty: "INTERMEDIATE",
    field: "Web Development",
  },
  {
    id: "q10",
    text: "What is the difference between supervised and unsupervised learning?",
    textAr: "ما الفرق بين التعلم الخاضع للإشراف وغير الخاضع للإشراف؟",
    options: [
      {
        id: "a",
        text: "Supervised uses labeled data; unsupervised does not",
        textAr: "الخاضع للإشراف يستخدم بيانات مصنّفة؛ غير الخاضع لا يستخدمها",
      },
      {
        id: "b",
        text: "Supervised is faster than unsupervised",
        textAr: "الخاضع للإشراف أسرع من غير الخاضع",
      },
      {
        id: "c",
        text: "Unsupervised requires more data than supervised",
        textAr: "غير الخاضع للإشراف يتطلب بيانات أكثر",
      },
      { id: "d", text: "They are the same thing", textAr: "كلاهما متطابق" },
    ],
    correctOptionId: "a",
    difficulty: "INTERMEDIATE",
    field: "AI & Machine Learning",
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    id: "q11",
    text: "What is the CAP theorem in distributed systems?",
    textAr: "ما هي نظرية CAP في الأنظمة الموزعة؟",
    options: [
      {
        id: "a",
        text: "A system can guarantee Consistency, Availability, and Partition tolerance simultaneously",
        textAr: "يمكن للنظام ضمان الاتساق والتوافر وتحمل التقسيم في آن واحد",
      },
      {
        id: "b",
        text: "A distributed system can only guarantee two of: Consistency, Availability, Partition tolerance",
        textAr:
          "يمكن للنظام الموزع ضمان اثنتين فقط من: الاتساق والتوافر وتحمل التقسيم",
      },
      {
        id: "c",
        text: "A system must choose between speed and accuracy",
        textAr: "يجب على النظام الاختيار بين السرعة والدقة",
      },
      {
        id: "d",
        text: "Consistency is always prioritized over availability",
        textAr: "يُعطى الاتساق الأولوية دائمًا على التوافر",
      },
    ],
    correctOptionId: "b",
    difficulty: "ADVANCED",
    field: "System Design",
  },
  {
    id: "q12",
    text: "What is a closure in JavaScript?",
    textAr: "ما هو الإغلاق (Closure) في JavaScript؟",
    options: [
      {
        id: "a",
        text: "A way to close browser windows",
        textAr: "طريقة لإغلاق نوافذ المتصفح",
      },
      {
        id: "b",
        text: "A function that retains access to its outer scope even after the outer function returns",
        textAr:
          "دالة تحتفظ بالوصول إلى نطاقها الخارجي حتى بعد إعادة الدالة الخارجية",
      },
      {
        id: "c",
        text: "A design pattern for database connections",
        textAr: "نمط تصميم لاتصالات قاعدة البيانات",
      },
      {
        id: "d",
        text: "A method to terminate async operations",
        textAr: "طريقة لإنهاء العمليات غير المتزامنة",
      },
    ],
    correctOptionId: "b",
    difficulty: "ADVANCED",
    field: "Programming",
  },
  {
    id: "q13",
    text: "What is the purpose of the Transformer architecture in AI?",
    textAr: "ما الغرض من معمارية المحوّل (Transformer) في الذكاء الاصطناعي؟",
    options: [
      {
        id: "a",
        text: "To transform image formats",
        textAr: "لتحويل صيغ الصور",
      },
      {
        id: "b",
        text: "To handle sequential data using self-attention mechanisms",
        textAr: "لمعالجة البيانات المتسلسلة باستخدام آليات الانتباه الذاتي",
      },
      {
        id: "c",
        text: "To compress neural network weights",
        textAr: "لضغط أوزان الشبكة العصبية",
      },
      {
        id: "d",
        text: "To convert data between different databases",
        textAr: "لتحويل البيانات بين قواعد بيانات مختلفة",
      },
    ],
    correctOptionId: "b",
    difficulty: "ADVANCED",
    field: "AI & Machine Learning",
  },
  {
    id: "q14",
    text: "What is the difference between OLTP and OLAP?",
    textAr: "ما الفرق بين OLTP وOLAP؟",
    options: [
      {
        id: "a",
        text: "OLTP is for analytics; OLAP is for transactions",
        textAr: "OLTP للتحليلات؛ OLAP للمعاملات",
      },
      {
        id: "b",
        text: "OLTP handles real-time transactions; OLAP handles complex analytical queries",
        textAr:
          "OLTP يتعامل مع المعاملات الفورية؛ OLAP يتعامل مع الاستعلامات التحليلية المعقدة",
      },
      {
        id: "c",
        text: "They are different names for the same concept",
        textAr: "هما مسميان مختلفان لنفس المفهوم",
      },
      {
        id: "d",
        text: "OLAP is faster than OLTP for all operations",
        textAr: "OLAP أسرع من OLTP في جميع العمليات",
      },
    ],
    correctOptionId: "b",
    difficulty: "ADVANCED",
    field: "Data",
  },
  {
    id: "q15",
    text: "What is eventual consistency in distributed systems?",
    textAr: "ما هو الاتساق النهائي في الأنظمة الموزعة؟",
    options: [
      {
        id: "a",
        text: "All nodes will always have consistent data immediately",
        textAr: "ستمتلك جميع العقد بيانات متسقة دائمًا وفورًا",
      },
      {
        id: "b",
        text: "Data consistency is never guaranteed",
        textAr: "لا يُضمن اتساق البيانات أبدًا",
      },
      {
        id: "c",
        text: "All nodes will become consistent given enough time without new updates",
        textAr: "ستصبح جميع العقد متسقة إذا أُتيح وقت كافٍ دون تحديثات جديدة",
      },
      {
        id: "d",
        text: "Only the primary node holds consistent data",
        textAr: "العقدة الأساسية فقط تحتفظ ببيانات متسقة",
      },
    ],
    correctOptionId: "c",
    difficulty: "ADVANCED",
    field: "System Design",
  },
];

export async function startPlacementTest(userId: string) {
  const test = await prisma.placementTest.create({
    data: {
      userId,
      status: "STARTED",
      score: 0,
      level: "BEGINNER",
      recommended: "",
      aiFeedback: "",
    },
  });
  return { testId: test.id, questions: QUESTION_BANK };
}

export type SubmitAnswers = {
  testId: string;
  answers: Record<string, string>; // questionId -> selectedOptionId
};

export async function submitPlacementTest({ testId, answers }: SubmitAnswers) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Score calculation
  let correct = 0;
  const fieldScores: Record<string, { correct: number; total: number }> = {};
  const difficultyResults = {
    BEGINNER: { correct: 0, total: 0 },
    INTERMEDIATE: { correct: 0, total: 0 },
    ADVANCED: { correct: 0, total: 0 },
  };

  for (const q of QUESTION_BANK) {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctOptionId;

    if (isCorrect) correct++;

    difficultyResults[q.difficulty].total++;
    if (isCorrect) difficultyResults[q.difficulty].correct++;

    if (!fieldScores[q.field]) fieldScores[q.field] = { correct: 0, total: 0 };
    fieldScores[q.field].total++;
    if (isCorrect) fieldScores[q.field].correct++;
  }

  const score = (correct / QUESTION_BANK.length) * 100;

  // Determine level
  const advancedRate =
    difficultyResults.ADVANCED.total > 0
      ? difficultyResults.ADVANCED.correct / difficultyResults.ADVANCED.total
      : 0;
  const intermediateRate =
    difficultyResults.INTERMEDIATE.total > 0
      ? difficultyResults.INTERMEDIATE.correct /
        difficultyResults.INTERMEDIATE.total
      : 0;

  let level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" = "BEGINNER";
  if (advancedRate >= 0.6) level = "ADVANCED";
  else if (intermediateRate >= 0.6 || score >= 50) level = "INTERMEDIATE";

  // Determine recommended field
  const sortedFields = Object.entries(fieldScores).sort(
    ([, a], [, b]) => b.correct / b.total - a.correct / a.total,
  );
  const recommended = sortedFields[0]?.[0] ?? "Programming";

  // AI Feedback via Gemini
  let aiFeedback = "";
  try {
    const prompt = `
You are an educational AI assistant. A student just completed a placement test.

Results:
- Overall Score: ${score.toFixed(1)}%
- Level Determined: ${level}
- Recommended Field: ${recommended}
- Field Breakdown: ${JSON.stringify(
      Object.fromEntries(
        Object.entries(fieldScores).map(([k, v]) => [
          k,
          `${v.correct}/${v.total}`,
        ]),
      ),
    )}

Provide a warm, encouraging, personalized feedback message (3-4 sentences) that:
1. Acknowledges their performance honestly
2. Highlights their strongest area
3. Suggests what to focus on to improve
4. Motivates them to start learning

Keep it concise, friendly, and professional. Do not use markdown, just plain text.
    `.trim();

    const result = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });
    aiFeedback = result.text?.trim() || "";
  } catch {
    aiFeedback =
      "Great effort completing the placement test! Based on your results, we've identified the best starting point for your learning journey. Keep up the great work and stay consistent in your studies.";
  }

  // Save to DB
  const updatedTest = await prisma.placementTest.update({
    where: { id: testId },
    data: {
      status: "COMPLETED",
      score,
      level,
      recommended,
      aiFeedback,
    },
  });

  // Update user level
  await prisma.user.update({
    where: { id: session.user.id },
    data: { level },
  });

  revalidatePath("/placement-test");

  return {
    score,
    level,
    recommended,
    aiFeedback,
    fieldScores,
    difficultyResults,
  };
}
