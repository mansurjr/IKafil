-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('monthly', 'initial');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'monthly';
