/*
  Warnings:

  - The `finalResult` column on the `PlacementTest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PlacementTest" DROP COLUMN "finalResult",
ADD COLUMN     "finalResult" DOUBLE PRECISION;
