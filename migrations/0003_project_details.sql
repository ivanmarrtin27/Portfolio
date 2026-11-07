ALTER TABLE projects ADD COLUMN docs_es TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN docs_en TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS project_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('screenshot', 'file')),
  label TEXT NOT NULL DEFAULT '',
  file_key TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project ON project_assets(project_id, sort_order, id);

UPDATE profile SET name = 'Iván Martín', updated_at = datetime('now') WHERE id = 1;
