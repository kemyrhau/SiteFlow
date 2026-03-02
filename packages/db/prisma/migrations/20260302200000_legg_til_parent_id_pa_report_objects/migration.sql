-- AlterTable
ALTER TABLE "report_objects" ADD COLUMN "parent_id" TEXT;

-- CreateIndex
CREATE INDEX "report_objects_parent_id_idx" ON "report_objects"("parent_id");

-- AddForeignKey
ALTER TABLE "report_objects" ADD CONSTRAINT "report_objects_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "report_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrer eksisterende conditionParentId fra config JSON til parent_id kolonne
UPDATE "report_objects"
SET "parent_id" = config->>'conditionParentId'
WHERE config->>'conditionParentId' IS NOT NULL
  AND config->>'conditionParentId' != '';

-- Fjern conditionParentId fra config JSON for migrerte rader
UPDATE "report_objects"
SET config = config - 'conditionParentId'
WHERE config->>'conditionParentId' IS NOT NULL;
