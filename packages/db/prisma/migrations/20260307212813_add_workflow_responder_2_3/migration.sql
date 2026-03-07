-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "responder_enterprise_2_id" TEXT,
ADD COLUMN     "responder_enterprise_3_id" TEXT;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_responder_enterprise_2_id_fkey" FOREIGN KEY ("responder_enterprise_2_id") REFERENCES "enterprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_responder_enterprise_3_id_fkey" FOREIGN KEY ("responder_enterprise_3_id") REFERENCES "enterprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
