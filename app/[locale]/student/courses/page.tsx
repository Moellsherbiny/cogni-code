import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEnrolledCourses } from "@/actions/student/courses";
import { EnrolledCoursesClient } from "@/components/course/enrolled-courses-client";

export const revalidate = 60;

export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const courses = await getEnrolledCourses(session.user.id);

  return <EnrolledCoursesClient courses={courses} />;
}
