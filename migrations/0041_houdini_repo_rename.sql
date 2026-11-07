-- Repo rename: houdini-analytics → Houdini-Analytics-v1.1
UPDATE projects SET
  docs_es = REPLACE(docs_es, 'https://github.com/ivanmarrtin27/houdini-analytics', 'https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1'),
  docs_en = REPLACE(docs_en, 'https://github.com/ivanmarrtin27/houdini-analytics', 'https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1'),
  repo_url = 'https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
  image_key = '/assets/projects/houdini-bet/logo.png',
  updated_at = datetime('now')
WHERE id = 3
   OR title_es LIKE 'Houdini Analytics%'
   OR title_en LIKE 'Houdini Analytics%'
   OR repo_url LIKE '%houdini-analytics%';
