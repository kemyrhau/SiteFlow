-- CreateTable: member_enterprises (mange-til-mange mellom ProjectMember og Enterprise)
CREATE TABLE "member_enterprises" (
    "id" TEXT NOT NULL,
    "project_member_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_enterprises_project_member_id_enterprise_id_key" ON "member_enterprises"("project_member_id", "enterprise_id");

-- Datamigrer: kopier eksisterende enterprise_id fra project_members til member_enterprises
INSERT INTO "member_enterprises" ("id", "project_member_id", "enterprise_id")
SELECT gen_random_uuid(), "id", "enterprise_id"
FROM "project_members"
WHERE "enterprise_id" IS NOT NULL;

-- Fjern enterprise_id-kolonnen fra project_members
ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_enterprise_id_fkey";
ALTER TABLE "project_members" DROP COLUMN "enterprise_id";

-- AddForeignKey
ALTER TABLE "member_enterprises" ADD CONSTRAINT "member_enterprises_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_enterprises" ADD CONSTRAINT "member_enterprises_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
