-- General personal branding: no internship / 2027 messaging in profile

UPDATE profile SET
  tagline_es = 'Desarrollo apps y webs',
  tagline_en = 'I build apps and websites',
  about_es = 'Tengo 20 años, soy de Almería y estudio el Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM). Combino lo del aula con proyectos propios: webs, apps móviles y herramientas en la nube.

Aprendo rápido aplicando lo que estudio a productos reales. Me interesa el desarrollo de software y seguir creciendo con proyectos y equipos.',
  about_en = 'I''m 20, from Almería (Spain), and I study Higher Vocational Training in Multiplatform Application Development (DAM). I combine coursework with my own projects: websites, mobile apps and cloud tools.

I learn by shipping real products. I want to grow as a software developer through projects and teamwork.',
  location_pref_es = 'Remoto y abierto a moverme fuera de España.',
  location_pref_en = 'Remote-friendly and open to relocating outside Spain.',
  updated_at = datetime('now')
WHERE id = 1;
