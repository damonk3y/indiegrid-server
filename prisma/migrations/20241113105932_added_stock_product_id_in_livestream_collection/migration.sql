-- AlterTable
ALTER TABLE "StockProductLivestreamCollection" ADD COLUMN     "stock_product_id_in_livestream_collection" SMALLSERIAL NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
