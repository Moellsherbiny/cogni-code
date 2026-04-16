"use client";

import { useRouter } from "next/navigation";
import { CourseForm } from "@/components/teacher/course-form";

export default function EditCourseClient({ course }: { course: any }) {
  const router = useRouter();

  return (
    <CourseForm
      initialData={course}
      onSuccess={() => {
        router.push("/teacher/courses");
      }}
    />
  );
}