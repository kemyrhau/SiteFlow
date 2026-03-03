-- AlterTable
ALTER TABLE "project_groups" ADD COLUMN     "domains" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "report_templates" ADD COLUMN     "domain" TEXT NOT NULL DEFAULT 'bygg';

-- CreateTable
CREATE TABLE "group_enterprises" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_enterprises_group_id_enterprise_id_key" ON "group_enterprises"("group_id", "enterprise_id");

-- AddForeignKey
ALTER TABLE "group_enterprises" ADD CONSTRAINT "group_enterprises_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "project_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_enterprises" ADD CONSTRAINT "group_enterprises_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
