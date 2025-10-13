/*
  Warnings:

  - You are about to drop the column `details_id` on the `devices` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[device_id]` on the table `device_details` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `device_id` to the `device_details` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."devices" DROP CONSTRAINT "devices_details_id_fkey";

-- AlterTable
ALTER TABLE "device_details" ADD COLUMN     "device_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "details_id";

-- CreateIndex
CREATE UNIQUE INDEX "device_details_device_id_key" ON "device_details"("device_id");

-- AddForeignKey
ALTER TABLE "device_details" ADD CONSTRAINT "device_details_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
