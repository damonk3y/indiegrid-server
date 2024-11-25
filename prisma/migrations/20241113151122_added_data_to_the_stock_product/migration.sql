-- AlterTable
ALTER TABLE "StockProduct" ADD COLUMN     "armpit_to_armpit" INTEGER,
ADD COLUMN     "chest_around" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "hip_around" INTEGER,
ADD COLUMN     "waist_around" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
