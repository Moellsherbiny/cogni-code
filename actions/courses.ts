"use server";
import { prisma } from "@/lib/prisma";
import { CoursePageData } from "@/types/course";

export async function getCourseById(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
  });
}

export async function getAllCourses() {
  return prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
        teacher: true,
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
  });
}

export async function getCoursePageData(
  courseId: string,
  currentUserId?: string,
): Promise<CoursePageData | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: {
        select: { id: true, name: true, image: true, email: true },
      },
      _count: {
        select: { enrollments: true },
      },
      modules: {
        orderBy: { createdAt: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              // only pull the current student's progress rows
              progress: currentUserId
                ? { where: { studentId: currentUserId }, select: { completed: true } }
                : false,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const isEnrolled = currentUserId
    ? !!(await prisma.enrollment.findUnique({
        where: { courseId_studentId: { courseId, studentId: currentUserId } },
      }))
    : false;

  return { ...course, isEnrolled };
}

export async function getAllLearningPaths() {
  try {
    const learningPaths = await prisma.learningPath.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        // We include the count of courses associated with this path
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return learningPaths;
  } catch (error) {
    console.error("[GET_LEARNING_PATHS]", error);
    return [];
  }
}

export async function getLearningPathById(id: string) {
  try {
    return await prisma.learningPath.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: {
            order: 'asc', // Uses the 'order' field from your schema
          },
          include: {
            course: {
              include: {
                teacher: {
                  select: { name: true, image: true }
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    return null;
  }
}

export async function getPathsWithCourses() {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        courses: {
          orderBy: {
            order: 'asc' // Respect the sequence defined in the schema
          },
          include: {
            course: {
              include: {
                teacher: {
                  select: { name: true, image: true }
                },
                _count: {
                  select: { modules: true, enrollments: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return paths;
  } catch (error) {
    console.error("[GET_PATHS_WITH_COURSES]", error);
    return [];
  }
}