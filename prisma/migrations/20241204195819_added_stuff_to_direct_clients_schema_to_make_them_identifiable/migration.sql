-- AlterTable
ALTER TABLE "DirectClient" ADD COLUMN     "chat_url" TEXT,
ADD COLUMN     "client_number" SMALLSERIAL NOT NULL,
ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
