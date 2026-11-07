-- Logo propio del proyecto Carta digital QR para bares (thumb en project-list).
UPDATE projects
SET image_key = '/assets/projects/qr-bares/logo.png',
    updated_at = datetime('now')
WHERE id = 2;
