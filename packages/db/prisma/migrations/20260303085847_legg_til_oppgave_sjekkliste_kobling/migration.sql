-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "checklist_field_id" TEXT,
ADD COLUMN     "checklist_id" TEXT;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
