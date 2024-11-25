/*
  Warnings:

  - You are about to drop the column `hip_around` on the `StockProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StockProduct" DROP COLUMN "hip_around";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
