-- AlterEnum
ALTER TYPE "StockStatus" ADD VALUE 'STORED_TO_SHIP_LATER_UNPAID';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
