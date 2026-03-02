-- AlterTable
ALTER TABLE "checklists" ADD COLUMN     "number" INTEGER;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "number" INTEGER,
ADD COLUMN     "template_id" TEXT;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
