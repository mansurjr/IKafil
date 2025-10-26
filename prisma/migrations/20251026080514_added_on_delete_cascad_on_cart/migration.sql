-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_device_id_fkey";

-- AlterTable
ALTER TABLE "contracts" ALTER COLUMN "buyer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
