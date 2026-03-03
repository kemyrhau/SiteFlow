-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "access_mode" TEXT NOT NULL DEFAULT 'inherit';

-- CreateTable
CREATE TABLE "folder_access" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "access_type" TEXT NOT NULL,
    "enterprise_id" TEXT,
    "group_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folder_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "folder_access_folder_id_access_type_enterprise_id_group_id__key" ON "folder_access"("folder_id", "access_type", "enterprise_id", "group_id", "user_id");

-- AddForeignKey
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "project_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_access" ADD CONSTRAINT "folder_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
