-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'EASY';
