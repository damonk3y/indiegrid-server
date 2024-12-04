/*
  Warnings:

  - You are about to drop the column `handle` on the `DirectClient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DirectClient" DROP COLUMN "handle";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
