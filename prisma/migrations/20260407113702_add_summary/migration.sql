-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mindMap" JSONB NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);
