-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "direct_client_id" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_direct_client_id_fkey" FOREIGN KEY ("direct_client_id") REFERENCES "DirectClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
