import { getCoursePageData } from "@/actions/courses";
import { auth } from "@/auth";
import { CoursePage } from "@/components/course/course-page-client";
import { getLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
type Props = {
  params: Promise<{courseId: string}>
}
async function Page({params}: Props) {
  const {courseId} = await params
 const session = await auth();
 if (!session?.user?.id) redirect("/auth/login");
  const course  = await getCoursePageData(courseId, session?.user?.id);
  if (!course) notFound();

  const isRTL = await getLocale() === "ar";

  return <CoursePage course={course} studentId={session.user.id} isTeacher={session.user.role === "TEACHER"} isRtl={isRTL} />;
}

export default Page