import { notFound } from "next/navigation";
import { getCourseDetail } from "@/actions/teacher/teacher";
import {
  getLearningPathsForCourse,
  getAllLearningPaths,
} from "@/actions/teacher/teacher";
import { EditCourseClient } from "@/components/teacher/edit-course-client";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const [course, linkedPaths, allPaths] = await Promise.all([
    getCourseDetail(params.courseId),
    getLearningPathsForCourse(params.courseId),
    getAllLearningPaths(),
  ]);

  if (!course) notFound();

  return (
    <EditCourseClient
      course={course}
      linkedPaths={linkedPaths}
      availablePaths={allPaths}
    />
  );
}