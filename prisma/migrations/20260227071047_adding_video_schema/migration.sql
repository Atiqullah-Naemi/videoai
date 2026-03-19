-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'GENERATING_SCRIPT', 'GENERATING_SCENES', 'GENERATING_VOICE', 'RENDERING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'PENDING',
    "script" TEXT,
    "scenes" JSONB,
    "productImages" JSONB,
    "voiceUrl" TEXT,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "errorMessage" TEXT,
    "renderProgress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_status_idx" ON "Video"("status");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
