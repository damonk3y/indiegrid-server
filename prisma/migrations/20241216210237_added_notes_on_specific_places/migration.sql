-- AlterTable
ALTER TABLE "DirectClient" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "custom_selling_price" DOUBLE PRECISION,
ADD COLUMN     "defect_note" TEXT,
ADD COLUMN     "has_defect" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
