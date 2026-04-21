/*
  Warnings:

  - Added the required column `userId` to the `MindMapHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MindMapHistory" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MindMapHistory" ADD CONSTRAINT "MindMapHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
