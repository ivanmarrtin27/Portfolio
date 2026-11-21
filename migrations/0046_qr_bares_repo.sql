-- Repo público del gestor de cartas QR
UPDATE projects SET
  repo_url = 'https://github.com/ivanmarrtin27/Gestor-Cartas-QR',
  updated_at = datetime('now')
WHERE id = 2
   OR title_es LIKE '%Carta digital QR%'
   OR title_en LIKE '%QR digital menu%';
