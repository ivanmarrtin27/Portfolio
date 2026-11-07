const UI = {
  es: {
    brand: 'Iván Martín Molina',
    'nav.about': 'Sobre mí',
    'nav.projects': 'Proyectos',
    'nav.certificates': 'Certificados',
    'nav.cv': 'CV',
    'nav.contact': 'Contacto',
    'nav.primary': 'Principal',
    'nav.language': 'Idioma',
    'nav.menu': 'Menú',
    'hero.eyebrow': 'DAM · Multiplataforma',
    'hero.ctaProjects': 'Ver proyectos',
    'hero.ctaCv': 'Descargar CV',
    'hero.ctaContact': 'Contactar',
    'meta.titleSuffix': 'Estudiante DAM',
    'meta.description': 'Iván Martín Molina — estudiante de DAM (Desarrollo de Aplicaciones Multiplataforma). Apps, webs y proyectos de software.',
    'about.title': 'Sobre mí',
    'about.lead': 'Quién soy y qué construyo',
    'about.skillsTitle': 'Tecnologías',
    'about.cat.frontend': 'Frontend',
    'about.cat.backend': 'Backend',
    'about.cat.mobile': 'Móvil',
    'about.cat.data': 'Bases de datos',
    'about.cat.tools': 'Herramientas',
    'about.skills.frontend': 'HTML, CSS, JavaScript, TypeScript, React, Angular, Ionic',
    'about.skills.backend': 'Java, Kotlin, Python, C#, Node.js, FastAPI, Cloudflare Pages',
    'about.skills.mobile': 'React Native, Expo, Unity 3D',
    'about.skills.data': 'MySQL, D1',
    'about.skills.tools': 'Odoo, WhatsApp Cloud API',
    'projects.title': 'Proyectos',
    'projects.lead': 'Webs y aplicaciones que he construido y sigo mejorando.',
    'projects.empty': 'Pronto habrá proyectos aquí.',
    'projects.live': 'Ver demo',
    'projects.carta': 'Ver Carta',
    'projects.privacy': 'Política de Privacidad',
    'projects.repo': 'Código',
    'projects.open': 'Ver detalle',
    'projects.close': 'Cerrar',
    'projects.docs': 'Documentación',
    'projects.shots': 'Capturas',
    'projects.files': 'Archivos',
    'projects.download': 'Descargar',
    'projects.stickers': 'Pegatinas QR',
    'projects.stickerTable': 'Ver QR mesa',
    'projects.stickerStaff': 'Ver QR encargado',
    'projects.panel': 'Panel encargado',
    'certificates.title': 'Certificados',
    'certificates.lead': 'Formación y cursos que he completado.',
    'certificates.empty': 'Aún no hay certificados publicados.',
    'certificates.open': 'Abrir',
    'cv.title': 'Currículum',
    'cv.lead': 'Aquí tienes mi currículum en español o en inglés.',
    'cv.es': 'CV · Español',
    'cv.en': 'CV · English',
    'contact.title': 'Contacto',
    'contact.lead': 'Si quieres contactar conmigo, te contesto por aquí.',
    'contact.cta': 'Contactar por email',
    'contact.phone': 'Teléfono',
    'contact.email': 'Email',
    'contact.github': 'GitHub',
    'contact.linkedin': 'LinkedIn',
    'contact.location': 'Disponibilidad',
    'footer.navLabel': 'Secciones'
  },
  en: {
    brand: 'Iván Martín Molina',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.certificates': 'Certificates',
    'nav.cv': 'Resume',
    'nav.contact': 'Contact',
    'nav.primary': 'Primary',
    'nav.language': 'Language',
    'nav.menu': 'Menu',
    'hero.eyebrow': 'DAM · Multiplatform',
    'hero.ctaProjects': 'View projects',
    'hero.ctaCv': 'Download CV',
    'hero.ctaContact': 'Get in touch',
    'meta.titleSuffix': 'DAM student',
    'meta.description': 'Iván Martín Molina — Multiplatform Application Development (DAM) student in Spain. Apps, websites and software projects.',
    'about.title': 'About',
    'about.lead': 'Who I am and what I build',
    'about.skillsTitle': 'Skills',
    'about.cat.frontend': 'Frontend',
    'about.cat.backend': 'Backend',
    'about.cat.mobile': 'Mobile',
    'about.cat.data': 'Databases',
    'about.cat.tools': 'Tools',
    'about.skills.frontend': 'HTML, CSS, JavaScript, TypeScript, React, Angular, Ionic',
    'about.skills.backend': 'Java, Kotlin, Python, C#, Node.js, FastAPI, Cloudflare Pages',
    'about.skills.mobile': 'React Native, Expo, Unity 3D',
    'about.skills.data': 'MySQL, D1',
    'about.skills.tools': 'Odoo, WhatsApp Cloud API',
    'projects.title': 'Projects',
    'projects.lead': 'Websites and apps I have built and keep improving.',
    'projects.empty': 'Projects coming soon.',
    'projects.live': 'Live demo',
    'projects.carta': 'View menu',
    'projects.privacy': 'Privacy Policy',
    'projects.repo': 'Code',
    'projects.open': 'View details',
    'projects.close': 'Close',
    'projects.docs': 'Documentation',
    'projects.shots': 'Screenshots',
    'projects.files': 'Files',
    'projects.download': 'Download',
    'projects.stickers': 'QR stickers',
    'projects.stickerTable': 'View table QR',
    'projects.stickerStaff': 'View staff QR',
    'projects.panel': 'Staff panel',
    'certificates.title': 'Certificates',
    'certificates.lead': 'Training and courses I’ve completed.',
    'certificates.empty': 'No certificates published yet.',
    'certificates.open': 'Open',
    'cv.title': 'Resume',
    'cv.lead': 'Here is my résumé in Spanish or English.',
    'cv.es': 'CV · Español',
    'cv.en': 'CV · English',
    'contact.title': 'Contact',
    'contact.lead': 'If you want to get in touch, I reply here.',
    'contact.cta': 'Email me',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.github': 'GitHub',
    'contact.linkedin': 'LinkedIn',
    'contact.location': 'Availability',
    'footer.navLabel': 'Sections'
  }
};

window.PortfolioI18n = {
  lang: localStorage.getItem('portfolio_lang') || 'es',
  t(key) {
    return UI[this.lang]?.[key] || UI.es[key] || key;
  },
  pick(es, en) {
    if (this.lang === 'en') return (en && String(en).trim()) || es || '';
    return es || '';
  },
  setLang(lang) {
    this.lang = lang === 'en' ? 'en' : 'es';
    localStorage.setItem('portfolio_lang', this.lang);
    document.documentElement.lang = this.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = this.t(key);
      if (value) el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const value = this.t(key);
      if (value) el.setAttribute('aria-label', value);
    });
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === this.lang);
    });
    document.querySelectorAll('.lang-toggle').forEach((el) => {
      el.dataset.lang = this.lang;
    });
  }
};
