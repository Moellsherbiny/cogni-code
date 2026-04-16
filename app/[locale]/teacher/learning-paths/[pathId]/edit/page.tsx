import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getLearningPathFull,
  getTeacherCoursesSimple,
} from "@/actions/teacher/teacher";
import { EditLearningPathClient } from "@/components/teacher/edit-learning-path-client";

export const dynamic = "force-dynamic";

export default async function EditLearningPathPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const [path, courses] = await Promise.all([
    getLearningPathFull((await params).pathId),
    getTeacherCoursesSimple(),
  ]);

  if (!path) notFound();

  const initialCourses = path.courses.map((lpc) => lpc.course);

  return (
    <EditLearningPathClient
      initialData={{
        id: path.id,
        title: path.title,
        description: path.description,
        thumbnail: path.thumbnail,
        courses: initialCourses,
      }}
      availableCourses={courses}
    />
  );
}