-- DropForeignKey
ALTER TABLE "public"."carts" DROP CONSTRAINT "carts_user_id_fkey";

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
