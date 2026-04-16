/*
  Warnings:

  - You are about to drop the column `finalResult` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `history` on the `PlacementTest` table. All the data in the column will be lost.
  - Added the required column `aiFeedback` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommended` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlacementTest" DROP COLUMN "finalResult",
DROP COLUMN "history",
ADD COLUMN     "aiFeedback" TEXT NOT NULL,
ADD COLUMN     "level" "StudentLevel" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "recommended" TEXT NOT NULL,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL;
