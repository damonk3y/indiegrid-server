-- AlterTable
ALTER TABLE "StockProductImages" ALTER COLUMN "image_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
