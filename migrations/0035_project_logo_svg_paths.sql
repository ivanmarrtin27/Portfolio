-- Keep project thumbnails on static assets tracked in this repository.

UPDATE projects SET image_key = '/assets/projects/houdini-bet/logo.svg', updated_at = datetime('now')
WHERE title_es = 'Houdini Bet';

UPDATE projects SET image_key = '/assets/projects/melodix/logo.svg', updated_at = datetime('now')
WHERE title_es = 'Melodix';

UPDATE projects SET image_key = '/assets/projects/ovisoft/logo.svg', updated_at = datetime('now')
WHERE title_es LIKE 'Ovisoft%';

UPDATE projects SET image_key = '/assets/projects/quedada/logo.svg', updated_at = datetime('now')
WHERE title_es = 'Quedada';
