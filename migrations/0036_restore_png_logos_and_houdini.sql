-- Restaurar logos PNG originales + actualizar solo Houdini Bet (logo PNG + URL pública)

UPDATE projects SET image_key = '/assets/projects/qr-bares/logo.png', updated_at = datetime('now')
WHERE title_es LIKE '%Carta digital QR%' OR title_en LIKE '%QR digital menu%';

UPDATE projects SET image_key = '/assets/projects/citaclara/klaro-logo.png', updated_at = datetime('now')
WHERE title_es = 'Klaro-Chat Bot' OR title_en = 'Klaro-Chat Bot';

UPDATE projects SET
  image_key = '/assets/projects/houdini-bet/logo.png',
  live_url = 'https://houdini-bet.pages.dev',
  updated_at = datetime('now')
WHERE title_es = 'Houdini Bet' OR title_en = 'Houdini Bet';

UPDATE projects SET image_key = '/assets/projects/melodix/logo.png', updated_at = datetime('now')
WHERE title_es = 'Melodix';

UPDATE projects SET image_key = '/assets/projects/ovisoft/logo.png', updated_at = datetime('now')
WHERE title_es LIKE 'Ovisoft%';

UPDATE projects SET image_key = '/assets/projects/quedada/logo.png', updated_at = datetime('now')
WHERE title_es = 'Quedada';
