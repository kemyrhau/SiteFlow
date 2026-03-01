-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "drawing_id" TEXT,
ADD COLUMN     "position_x" DOUBLE PRECISION,
ADD COLUMN     "position_y" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_drawing_id_fkey" FOREIGN KEY ("drawing_id") REFERENCES "drawings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
