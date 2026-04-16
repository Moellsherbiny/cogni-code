import { getTeacherCoursesSimple } from "@/actions/teacher/teacher";
import { NewLearningPathClient } from "@/components/teacher/new-learning-path-client";



export default async function NewLearningPathPage() {
  const courses = await getTeacherCoursesSimple();
  return <NewLearningPathClient availableCourses={courses} />;
}