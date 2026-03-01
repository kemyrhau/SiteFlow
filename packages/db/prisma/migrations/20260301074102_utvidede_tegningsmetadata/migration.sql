-- AlterTable
ALTER TABLE "drawings" ADD COLUMN     "description" TEXT,
ADD COLUMN     "discipline" TEXT,
ADD COLUMN     "drawing_number" TEXT,
ADD COLUMN     "drawing_type" TEXT,
ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "issued_at" TIMESTAMP(3),
ADD COLUMN     "originator" TEXT,
ADD COLUMN     "revision" TEXT NOT NULL DEFAULT 'A',
ADD COLUMN     "scale" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'utkast';

-- CreateTable
CREATE TABLE "drawing_revisions" (
    "id" TEXT NOT NULL,
    "drawing_id" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "description" TEXT,
    "uploaded_by_id" TEXT,
    "status" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drawing_revisions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "drawing_revisions" ADD CONSTRAINT "drawing_revisions_drawing_id_fkey" FOREIGN KEY ("drawing_id") REFERENCES "drawings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drawing_revisions" ADD CONSTRAINT "drawing_revisions_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
