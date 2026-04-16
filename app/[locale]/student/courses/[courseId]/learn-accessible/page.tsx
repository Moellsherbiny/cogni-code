import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { AccessibleLearningClient } from "@/components/accessible-learning/client";

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: { lessonId?: string };
}


export default async function AccessibleLearnPage({
  params,
  searchParams,
}: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: (await params).courseId,
        studentId: session.user.id,
      },
    },
  });
//   if (!enrollment) redirect(`/courses/${(await params).courseId}`);

  // Load full course tree
  const course = await prisma.course.findUnique({
    where: { id: (await params).courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: { studentId: session.user.id },
              },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();

  // Flatten all lessons
  const allLessons = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title })),
  );

  // Active lesson
  const activeLessonId =
    searchParams.lessonId ??
    allLessons.find((l) => !l.progress[0]?.completed)?.id ??
    allLessons[0]?.id;

  const activeLesson =
    allLessons.find((l) => l.id === activeLessonId) ?? allLessons[0];

  const locale = await getLocale();
  return (
    <AccessibleLearningClient
      course={course}
      allLessons={allLessons}
      activeLesson={activeLesson ?? null}
      userId={session.user.id}
      locale={locale}
    />
  );
}
