-- Remove legacy QR seed from 0001 when the seeded "Carta digital QR" project exists
DELETE FROM project_assets
WHERE project_id IN (
  SELECT id FROM projects
  WHERE title_es = 'QR Bares — cartas digitales'
     OR title_en = 'QR Bares — digital menus'
);

DELETE FROM projects
WHERE title_es = 'QR Bares — cartas digitales'
   OR title_en = 'QR Bares — digital menus';
