-- Migration: add_nub_sequence
-- Adds NUB (Nomor Urut Bangunan) to TanahKasDesa
-- Format: "0001", "0002", ... (4-digit zero-padded, never reused)

-- Step 1: Add nub column (nullable initially for backfill)
ALTER TABLE "TanahKasDesa" ADD COLUMN "nub" TEXT;

-- Step 2: Create unique index (allow NULLs — multiple NULLs are allowed)
CREATE UNIQUE INDEX "TanahKasDesa_nub_key" ON "TanahKasDesa"("nub");

-- Step 3: Create PostgreSQL sequence for NUB (starts at 1)
CREATE SEQUENCE nub_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  NO CYCLE;

-- Step 4: Backfill all existing non-deleted records ordered by createdAt ASC
-- This assigns 0001, 0002, ... to existing 473 records
UPDATE "TanahKasDesa" t
SET nub = LPAD(sub.rn::text, 4, '0')
FROM (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "TanahKasDesa"
  WHERE "deletedAt" IS NULL
) sub
WHERE t.id = sub.id;

-- Step 5: Advance sequence to the next value after the highest existing NUB
-- So the next new record gets 0474 (or whatever comes after the last backfilled)
SELECT setval(
  'nub_seq',
  COALESCE((SELECT MAX(CAST(nub AS INTEGER)) FROM "TanahKasDesa" WHERE nub IS NOT NULL), 0)
);

-- Step 6: Add Prisma index on nub column
CREATE INDEX "TanahKasDesa_nub_idx" ON "TanahKasDesa"("nub");
