import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeacherCourses } from "@/actions/teacher/teacher";
import { TeacherCoursesClient } from "@/components/teacher/teacher-courses-client";

export default async function TeacherCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const courses = await getTeacherCourses();
  return <TeacherCoursesClient courses={courses} />;
}

