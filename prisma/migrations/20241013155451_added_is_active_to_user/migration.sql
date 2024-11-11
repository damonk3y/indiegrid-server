-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
