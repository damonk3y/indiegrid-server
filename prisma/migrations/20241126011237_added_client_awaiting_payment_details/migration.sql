-- AlterEnum
ALTER TYPE "StockStatus" ADD VALUE 'CLIENT_AWAITING_PAYMENT_DETAILS';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
