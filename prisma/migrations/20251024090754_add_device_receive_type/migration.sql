-- CreateEnum
CREATE TYPE "ReceiveType" AS ENUM ('pickup', 'delivery');

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "branch_id" INTEGER,
ADD COLUMN     "receive_type" "ReceiveType" NOT NULL DEFAULT 'delivery';

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
