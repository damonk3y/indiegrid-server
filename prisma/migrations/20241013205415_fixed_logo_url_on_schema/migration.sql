/*
  Warnings:

  - You are about to drop the column `logo_url` on the `StoreManager` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "logo_url" TEXT;

-- AlterTable
ALTER TABLE "StoreManager" DROP COLUMN "logo_url";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
