-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
