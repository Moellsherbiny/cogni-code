// types/course.ts
// Mirrors exactly what Prisma returns with the includes used in getCoursePageData()

export type StudentLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type LessonType   = "VIDEO" | "TEXT" | "MATERIAL";

export interface CoursePageLesson {
  id:          string;
  title:       string;
  content:     string | null;
  videoUrl:    string | null;
  materialUrl: string | null;
  transcript:  string | null;
  type:        LessonType;
  order:       number;
  progress:    { completed: boolean }[]; // scoped to current user
}

export interface CoursePageModule {
  id:          string;
  title:       string;
  description: string | null;
  level:       StudentLevel;
  lessons:     CoursePageLesson[];
}

export interface CoursePageTeacher {
  id:    string;
  name:  string | null;
  image: string | null;
  email: string;
}

export interface CoursePageData {
  id:          string;
  title:       string;
  description: string | null;
  thumbnail:   string | null;
  createdAt:   Date;
  updatedAt:   Date;
  teacher:     CoursePageTeacher;
  modules:     CoursePageModule[];
  _count: {
    enrollments: number;
  };
  isEnrolled:  boolean; // resolved server-side
}