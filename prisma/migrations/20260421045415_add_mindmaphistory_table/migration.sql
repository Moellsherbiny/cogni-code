-- CreateTable
CREATE TABLE "MindMapHistory" (
    "id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mindmap" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MindMapHistory_pkey" PRIMARY KEY ("id")
);
