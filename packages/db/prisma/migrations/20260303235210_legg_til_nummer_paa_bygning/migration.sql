-- AlterTable
ALTER TABLE "buildings" ADD COLUMN     "number" INTEGER;

-- Backfill: gi eksisterende bygninger nummer per prosjekt (sortert etter opprettelsesdato)
UPDATE "buildings" b
SET "number" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at ASC) AS rn
  FROM "buildings"
) sub
WHERE b.id = sub.id;
