ALTER TABLE profile ADD COLUMN github TEXT NOT NULL DEFAULT '';
ALTER TABLE profile ADD COLUMN instagram TEXT NOT NULL DEFAULT '';

UPDATE profile SET
  name = 'Iván Martín Molina',
  github = 'https://github.com/ivanmarrtin27',
  instagram = 'https://www.instagram.com/ivanmarrtin_/',
  linkedin = '',
  updated_at = datetime('now')
WHERE id = 1;
