-- AlterTable
ALTER TABLE "buildings" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'bygg';

-- AlterTable
ALTER TABLE "drawings" ADD COLUMN     "geo_reference" JSONB;
