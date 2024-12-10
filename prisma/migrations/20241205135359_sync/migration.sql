-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
