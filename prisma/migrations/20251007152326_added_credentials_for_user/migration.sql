/*
  Warnings:

  - You are about to drop the column `registered_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expire" TIMESTAMP(3),
ADD COLUMN     "token" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "registered_at",
ADD COLUMN     "activation_link" TEXT,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expire" TIMESTAMP(3);
