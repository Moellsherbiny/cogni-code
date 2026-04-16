-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_otp_verified" BOOLEAN,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3);
