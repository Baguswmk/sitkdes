-- Migration: update_nub_to_5_digits
-- Update all existing NUB values to 5-digit zero-padded numbers
UPDATE "TanahKasDesa"
SET nub = LPAD(nub, 5, '0')
WHERE nub IS NOT NULL AND LENGTH(nub) < 5;
