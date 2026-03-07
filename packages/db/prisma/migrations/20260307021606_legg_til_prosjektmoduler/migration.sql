-- CreateTable
CREATE TABLE "project_modules" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "module_slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_modules_project_id_module_slug_key" ON "project_modules"("project_id", "module_slug");

-- AddForeignKey
ALTER TABLE "project_modules" ADD CONSTRAINT "project_modules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
