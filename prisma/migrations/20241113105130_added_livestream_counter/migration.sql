-- AlterTable
ALTER TABLE "LivestreamCollection" ADD COLUMN     "number" SMALLSERIAL NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
