CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Iván',
  tagline_es TEXT NOT NULL DEFAULT 'Estudiante de DAM · Buscando prácticas internacionales',
  tagline_en TEXT NOT NULL DEFAULT 'DAM student · Looking for international internships',
  about_es TEXT NOT NULL DEFAULT '',
  about_en TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  location_pref_es TEXT NOT NULL DEFAULT 'Disponible para prácticas fuera de España (UE / remoto)',
  location_pref_en TEXT NOT NULL DEFAULT 'Open to internships outside Spain (EU / remote)',
  cv_key TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  description_es TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  tech TEXT NOT NULL DEFAULT '',
  live_url TEXT NOT NULL DEFAULT '',
  repo_url TEXT NOT NULL DEFAULT '',
  image_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  issuer TEXT NOT NULL DEFAULT '',
  issued_at TEXT NOT NULL DEFAULT '',
  file_key TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  fails INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT
);

INSERT OR IGNORE INTO profile (
  id, name, tagline_es, tagline_en, about_es, about_en, email, location_pref_es, location_pref_en
) VALUES (
  1,
  'Iván',
  'Estudiante de DAM · Buscando prácticas internacionales',
  'DAM student · Looking for international internships',
  'Soy estudiante de 2º de Desarrollo de Aplicaciones Multiplataforma. Construyo productos web reales (como cartas digitales por QR) y quiero aportar en un equipo fuera de España: aprender rápido, entregar bien y crecer como desarrollador.',
  'I am a second-year Multiplatform Application Development (DAM) student. I build real web products (such as QR digital menus) and want to contribute in a team outside Spain: learn fast, ship well, and grow as a developer.',
  '',
  'Disponible para prácticas fuera de España (UE / remoto)',
  'Open to internships outside Spain (EU / remote)'
);

INSERT OR IGNORE INTO projects (
  id, title_es, title_en, description_es, description_en, tech, live_url, sort_order
) VALUES (
  1,
  'QR Bares — cartas digitales',
  'QR Bares — digital menus',
  'Plataforma multi-bar con carta pública por QR, panel de encargado con PIN y panel de gestión del dueño. Cloudflare Pages, D1 y auth por sesión.',
  'Multi-venue platform with public QR menus, PIN-protected staff panel and owner control. Cloudflare Pages, D1 and session auth.',
  'HTML, CSS, JavaScript, Cloudflare Pages, D1',
  '',
  0
);
