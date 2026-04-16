import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getStudyCourseDetail } from "@/actions/student/courses";
import { StudyClient } from "@/components/course/study-client";
import { prisma } from "@/lib/prisma";
import { getStudentLevel } from "@/actions/student/level";

export const dynamic = "force-dynamic";

interface StudyPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const course = await getStudyCourseDetail(
    (await params).courseId,
    session.user.id,
  );
  if (!course) notFound();

  const studentLevel = await getStudentLevel(session.user.id);

  return (
    <StudyClient
      course={course}
      studentLevel={studentLevel ?? "BEGINNER"}
      studentId={session.user.id}
    />
  );
}
