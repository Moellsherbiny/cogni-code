/*
  Warnings:

  - You are about to drop the `Assessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentOptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssessmentAttempt" DROP CONSTRAINT "AssessmentAttempt_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentAttempt" DROP CONSTRAINT "AssessmentAttempt_studentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentOptions" DROP CONSTRAINT "AssessmentOptions_questionId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentQuestion" DROP CONSTRAINT "AssessmentQuestion_assessmentId_fkey";

-- DropTable
DROP TABLE "Assessment";

-- DropTable
DROP TABLE "AssessmentAttempt";

-- DropTable
DROP TABLE "AssessmentOptions";

-- DropTable
DROP TABLE "AssessmentQuestion";

-- CreateTable
CREATE TABLE "PlacementTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "history" JSONB NOT NULL,
    "finalResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlacementTest" ADD CONSTRAINT "PlacementTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
