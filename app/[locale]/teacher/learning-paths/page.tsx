import {
  getLearningPaths,
  getTeacherCourses as getTC,
} from "@/actions/teacher/teacher";
import { TeacherLearningPathsClient } from "@/components/teacher/teacher-learning-paths-client";

export default async function TeacherLearningPathsPage() {
  const [paths, courses] = await Promise.all([getLearningPaths(), getTC()]);
  return (
    <TeacherLearningPathsClient paths={paths} availableCourses={courses} />
  );
}
