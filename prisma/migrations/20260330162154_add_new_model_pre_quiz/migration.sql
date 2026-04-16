-- CreateEnum
CREATE TYPE "StudentLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" "StudentLevel" NOT NULL DEFAULT 'BEGINNER';

-- CreateTable
CREATE TABLE "PreQuiz" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreQuizQuestion" (
    "preQuizId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "PreQuizQuestion_pkey" PRIMARY KEY ("preQuizId","questionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreQuiz_courseId_studentId_key" ON "PreQuiz"("courseId", "studentId");

-- AddForeignKey
ALTER TABLE "PreQuiz" ADD CONSTRAINT "PreQuiz_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreQuizQuestion" ADD CONSTRAINT "PreQuizQuestion_preQuizId_fkey" FOREIGN KEY ("preQuizId") REFERENCES "PreQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreQuizQuestion" ADD CONSTRAINT "PreQuizQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
