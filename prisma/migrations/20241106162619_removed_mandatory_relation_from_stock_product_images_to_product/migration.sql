-- DropForeignKey
ALTER TABLE "StockProductImages" DROP CONSTRAINT "StockProductImages_stock_product_id_fkey";

-- AlterTable
ALTER TABLE "StockProductImages" ALTER COLUMN "stock_product_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- AddForeignKey
ALTER TABLE "StockProductImages" ADD CONSTRAINT "StockProductImages_stock_product_id_fkey" FOREIGN KEY ("stock_product_id") REFERENCES "StockProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
