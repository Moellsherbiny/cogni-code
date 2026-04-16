import { notFound } from "next/navigation";
import { getCourseById } from "@/actions/teacher/course";
// import EditCourseClient from "./edit-course-client";
import { CourseDetailClient } from "@/components/teacher/course-detail-client";
import { getCourseDetail } from "@/actions/teacher/teacher";

type Params = {
    params: Promise<{ courseId: string }>

}

export default async function Page({ params }: Params ) {
  const resolvedParams = await params;
  const course = await getCourseDetail(resolvedParams.courseId);

  if (!course) return notFound();

  return <CourseDetailClient  course={course} />;
}