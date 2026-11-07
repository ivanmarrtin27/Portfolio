ALTER TABLE profile ADD COLUMN phone TEXT NOT NULL DEFAULT '';

UPDATE profile
SET
  email = 'ivanmarrtin2703@gmail.com',
  phone = '+34 602 66 56 41',
  updated_at = datetime('now')
WHERE id = 1;
