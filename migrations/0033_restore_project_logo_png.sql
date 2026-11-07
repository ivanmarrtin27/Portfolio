-- Restore project thumbnails to PNG paths (production assets)

UPDATE projects SET image_key = '/assets/projects/qr-bares/logo.png', updated_at = datetime('now')
WHERE id = 2 OR title_es LIKE '%Carta digital QR%' OR title_en LIKE '%QR digital menu%';

UPDATE projects SET image_key = '/assets/projects/citaclara/klaro-logo.png', updated_at = datetime('now')
WHERE title_es = 'Klaro-Chat Bot' OR title_en = 'Klaro-Chat Bot';

UPDATE projects SET image_key = '/assets/projects/houdini-bet/logo.png', updated_at = datetime('now')
WHERE id = 3 OR title_es = 'Houdini Bet';

UPDATE projects SET image_key = '/assets/projects/melodix/logo.png', updated_at = datetime('now')
WHERE id = 4 OR title_es = 'Melodix';

UPDATE projects SET image_key = '/assets/projects/ovisoft/logo.png', updated_at = datetime('now')
WHERE id = 5 OR title_es LIKE 'Ovisoft%';

UPDATE projects SET image_key = '/assets/projects/quedada/logo.png', updated_at = datetime('now')
WHERE id = 6 OR title_es = 'Quedada';
