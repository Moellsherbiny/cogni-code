import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GenerateQuizForm } from "@/components/quiz/generate-quiz-form";
import GeneratePageHeader from "@/components/quiz/generate-page-header";

export default async function GenerateQuizPage() {
  const session = await auth();

  const courses = await prisma.course.findMany({
    where: { teacherId: session!.user.id },
    select: { id: true, title: true },
  });

  return (
    <div className="p-6 space-y-6">
      <GeneratePageHeader />
      <GenerateQuizForm courseId={courses[0]?.id ?? ""} courses={courses} />
    </div>
  );
}