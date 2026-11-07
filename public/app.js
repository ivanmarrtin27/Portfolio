(() => {
  const i18n = window.PortfolioI18n;
  let data = { profile: null, projects: [], certificates: [] };

  const els = {
    heroName: document.getElementById('heroName'),
    heroTagline: document.getElementById('heroTagline'),
    aboutText: document.getElementById('aboutText'),
    aboutPanel: document.getElementById('aboutPanel'),
    projectList: document.getElementById('projectList'),
    projectsEmpty: document.getElementById('projectsEmpty'),
    certList: document.getElementById('certList'),
    certsEmpty: document.getElementById('certsEmpty'),
    contactRow: document.getElementById('contactRow'),
    footerName: document.getElementById('footerName'),
    footerCopy: document.getElementById('footerCopy'),
    navToggle: document.getElementById('navToggle'),
    nav: document.querySelector('.nav')
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linkifyDocs(text) {
    const source = String(text || '');
    const re = /(https?:\/\/[^\s<]+)|(\/demos\/[^\s<]+)/g;
    let html = '';
    let last = 0;
    let match;
    while ((match = re.exec(source))) {
      html += escapeHtml(source.slice(last, match.index));
      const url = match[0];
      const href = escapeHtml(url);
      html += `<a href="${href}" target="_blank" rel="noopener">${href}</a>`;
      last = match.index + url.length;
    }
    html += escapeHtml(source.slice(last));
    return html.replace(/\n/g, '<br>');
  }

  function extractStaffPanelUrl(docs) {
    const match = String(docs || '').match(/https?:\/\/[^\s]*admin\.html[^\s]*/i);
    return match ? match[0] : '';
  }

  /* Familias: lang | framework | data | cloud | web (fallback muted) */
  const TECH_FAMILY = [
    ['react native', 'tech-framework'],
    ['cloudflare pages', 'tech-cloud'],
    ['cloudflare workers', 'tech-cloud'],
    ['cloudflare', 'tech-cloud'],
    ['typescript', 'tech-lang'],
    ['javascript', 'tech-lang'],
    ['fastapi', 'tech-framework'],
    ['mongodb', 'tech-data'],
    ['express', 'tech-framework'],
    ['android', 'tech-framework'],
    ['angular', 'tech-framework'],
    ['ionic', 'tech-framework'],
    ['kotlin', 'tech-lang'],
    ['python', 'tech-lang'],
    ['mysql', 'tech-data'],
    ['unity 3d', 'tech-framework'],
    ['unity', 'tech-framework'],
    ['odoo', 'tech-framework'],
    ['expo', 'tech-framework'],
    ['react', 'tech-framework'],
    ['java', 'tech-lang'],
    ['c#', 'tech-lang'],
    ['node', 'tech-framework'],
    ['vite', 'tech-framework'],
    ['html', 'tech-web'],
    ['css', 'tech-web'],
    ['pwa', 'tech-web'],
    ['d1', 'tech-data'],
    ['r2', 'tech-data'],
    ['pages', 'tech-cloud'],
    ['functions', 'tech-cloud'],
    ['workers', 'tech-cloud'],
    ['whatsapp', 'tech-cloud'],
    ['js', 'tech-lang'],
    ['ts', 'tech-lang'],
    ['git', 'tech-web'],
    ['github', 'tech-web'],
    ['sql', 'tech-data']
  ];

  function techFamilyClass(token) {
    const key = String(token || '').toLowerCase().trim();
    if (!key) return '';
    for (const [name, cls] of TECH_FAMILY) {
      if (key === name || key.startsWith(`${name} `) || key.endsWith(` ${name}`) || key.includes(` ${name} `)) {
        return cls;
      }
    }
    for (const [name, cls] of TECH_FAMILY) {
      if (name.length >= 3 && key.includes(name)) return cls;
    }
    return '';
  }

  function fillTechTokens(el, tech) {
    if (!el) return;
    el.textContent = '';
    String(tech || '')
      .split(/[,·|/]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((token) => {
        const span = document.createElement('span');
        const family = techFamilyClass(token);
        span.className = family ? `tech-token ${family}` : 'tech-token';
        span.dataset.tech = token.toLowerCase();
        span.textContent = token;
        el.appendChild(span);
      });
  }

  function isQrCartaProject(project) {
    if (Number(project.id) === 2) return true;
    const title = `${project.title_es || ''} ${project.title_en || ''}`;
    if (/carta\s*digital|qr\s*bares|qr\s*\/\s*carta/i.test(title)) return true;
    const url = String(project.live_url || '');
    if (/mi-carta|qr-bares/i.test(url)) return true;
    return false;
  }

  function isQrAssetUrl(url) {
    const s = String(url || '');
    // Logos de proyecto en /assets/projects/… no son capturas QR.
    if (/\/assets\/projects\//i.test(s)) return false;
    return /\/assets\/demos\/qr-bares\/|qr-mesa|qr-encargado/i.test(s);
  }

  function projectLogoClass(url) {
    if (/\/assets\/projects\/ovisoft\//i.test(String(url || ''))) {
      return 'project-logo--ovisoft';
    }
    if (/\/assets\/projects\/citaclara\//i.test(String(url || '')) || /klaro-logo/i.test(String(url || ''))) {
      return 'project-logo--klaro';
    }
    return '';
  }

  function projectThumbUrl(project, shots) {
    // Solo logo real (image_url). Nunca promocionar capturas QR como thumb.
    if (project.image_url && !isQrAssetUrl(project.image_url)) {
      return project.image_url;
    }
    if (isQrCartaProject(project)) return '';
    const shot = (shots || []).find((s) => {
      const label = (s.label || '').toLowerCase();
      if (label === 'logo') return false;
      if (/^qr\s/i.test(s.label || '')) return false;
      if (isQrAssetUrl(s.file_url)) return false;
      return true;
    });
    return shot ? shot.file_url : '';
  }

  function liveButtonLabel(project) {
    const url = String(project.live_url || '');
    if (/quedada-privacy|privacy/i.test(url)) return i18n.t('projects.privacy');
    if (/mi-carta|bar=/i.test(url)) return i18n.t('projects.carta');
    return i18n.t('projects.live');
  }

  function syncLangQuery(lang) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);
    } catch {
      /* ignore */
    }
  }

  function applyDocumentMeta(profile) {
    const name = (profile && profile.name) || 'Iván Martín Molina';
    const suffix = i18n.t('meta.titleSuffix');
    const title = `${name} · ${suffix}`;
    const description = i18n.t('meta.description');
    document.title = title;

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el && value) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:locale"]', 'content', i18n.lang === 'en' ? 'en_US' : 'es_ES');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }

  function renderSkills() {
    document.querySelectorAll('[data-skills]').forEach((el) => {
      const key = el.getAttribute('data-skills');
      fillTechTokens(el, i18n.t(key));
    });
  }

  function render() {
    const p = data.profile || {};
    applyDocumentMeta(p);
    els.heroName.textContent = p.name || 'Portfolio';
    els.heroTagline.textContent = i18n.pick(p.tagline_es, p.tagline_en);
    const aboutRaw = i18n.pick(p.about_es, p.about_en);
    els.aboutText.innerHTML = '';
    String(aboutRaw || '')
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const para = document.createElement('p');
        para.textContent = part;
        els.aboutText.appendChild(para);
      });
    if (!els.aboutText.childElementCount && aboutRaw) {
      const para = document.createElement('p');
      para.textContent = aboutRaw;
      els.aboutText.appendChild(para);
    }
    if (els.aboutPanel) {
      els.aboutPanel.hidden = false;
      els.aboutPanel.setAttribute('aria-hidden', 'false');
    }
    const aboutGrid = document.getElementById('aboutGrid') || document.querySelector('.about-grid');
    if (aboutGrid) {
      aboutGrid.classList.remove('has-video');
      aboutGrid.classList.add('has-panel');
    }

    renderSkills();
    renderProjects();
    renderCerts();
    renderContact();
    if (els.footerName) els.footerName.textContent = p.name || 'Iván Martín Molina';
    if (els.footerCopy) {
      els.footerCopy.textContent = `© ${new Date().getFullYear()} ${p.name || 'Iván Martín Molina'}`.trim();
    }
    i18n.setLang(i18n.lang);
    syncLangQuery(i18n.lang);
    observeReveals();
  }

  let motionIo = null;

  function observeReveals() {
    if (!motionIo) return;
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      motionIo.observe(el);
    });
  }

  function initMotion() {
    const header = document.querySelector('.site-header');
    const progressBar = document.getElementById('scrollProgressBar');
    const progressTrack = progressBar?.parentElement;
    let progressRaf = 0;
    const updateScrollChrome = () => {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
      if (progressBar) {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
        const p = y <= 0 ? 0 : Math.min(1, y / max);
        progressBar.style.transform = `scaleX(${p})`;
        // Start at 0 — only show once scroll has started.
        if (progressTrack) progressTrack.classList.toggle('is-active', p > 0);
      }
    };
    const onScroll = () => {
      if (progressRaf) return;
      progressRaf = window.requestAnimationFrame(() => {
        progressRaf = 0;
        updateScrollChrome();
      });
    };
    updateScrollChrome();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    motionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          motionIo.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    observeReveals();
  }

  let openProjectId = null;

  function renderProjects() {
    const items = data.projects || [];
    els.projectList.innerHTML = '';
    els.projectsEmpty.hidden = items.length > 0;

    items.forEach((project, index) => {
      const isOpen = openProjectId === project.id;
      const article = document.createElement('article');
      article.className = `project-item reveal is-visible${isOpen ? ' is-open' : ''}`;
      const delay = Math.min(index, 4);
      if (delay) article.classList.add(`reveal-delay-${delay}`);

      const title = i18n.pick(project.title_es, project.title_en);
      const desc = i18n.pick(project.description_es, project.description_en);
      const docs = i18n.pick(project.docs_es, project.docs_en);
      const assets = project.assets || [];
      const shots = assets.filter((a) => a.kind === 'screenshot');
      const files = assets.filter((a) => a.kind === 'file');

      const thumbUrl = projectThumbUrl(project, shots);
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = `project-toggle${thumbUrl ? ' project-toggle--with-thumb' : ''}`;
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.innerHTML = `
        ${thumbUrl ? '<span class="project-thumb"><img alt="" loading="lazy" decoding="async"></span>' : ''}
        <div class="project-toggle-copy">
          <h3 class="project-title"></h3>
          <p class="project-desc"></p>
          <p class="project-tech"></p>
        </div>
        <span class="project-chevron" aria-hidden="true"></span>
      `;
      if (thumbUrl) {
        const thumbImg = toggle.querySelector('.project-thumb img');
        thumbImg.src = `${thumbUrl}${thumbUrl.includes('?') ? '&' : '?'}v=4`;
        thumbImg.alt = title ? `Logo · ${title}` : '';
        const logoMod = projectLogoClass(thumbUrl);
        if (logoMod) thumbImg.classList.add(logoMod);
      }
      toggle.querySelector('.project-title').textContent = title;
      toggle.querySelector('.project-desc').textContent = desc;
      fillTechTokens(toggle.querySelector('.project-tech'), project.tech || '');
      toggle.addEventListener('click', () => {
        openProjectId = isOpen ? null : project.id;
        renderProjects();
        if (!isOpen) {
          article.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      const actions = document.createElement('div');
      actions.className = 'item-actions';
      if (project.live_url) {
        const a = document.createElement('a');
        a.className = 'btn btn-ghost';
        a.href = project.live_url;
        const isExternal = /^https?:\/\//i.test(project.live_url);
        if (isExternal) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        a.textContent = liveButtonLabel(project);
        a.addEventListener('click', (e) => e.stopPropagation());
        actions.appendChild(a);
      }
      const staffUrl = extractStaffPanelUrl(docs);
      if (staffUrl) {
        const a = document.createElement('a');
        a.className = 'btn btn-ghost';
        a.href = staffUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = i18n.t('projects.panel');
        a.addEventListener('click', (e) => e.stopPropagation());
        actions.appendChild(a);
      }
      if (project.repo_url) {
        const a = document.createElement('a');
        a.className = 'btn btn-ghost';
        a.href = project.repo_url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = i18n.t('projects.repo');
        a.addEventListener('click', (e) => e.stopPropagation());
        actions.appendChild(a);
      }

      article.appendChild(toggle);
      article.appendChild(actions);

      if (isOpen) {
        const detail = document.createElement('div');
        detail.className = 'project-detail';
        // Logo solo en la fila (thumb); no repetirlo en el detalle.
        const hasLogo = project.image_url && !isQrAssetUrl(project.image_url);
        const detailShots = hasLogo
          ? shots.filter((s) => (s.label || '').toLowerCase() !== 'logo')
          : shots;

        if (docs) {
          const docsBlock = document.createElement('div');
          docsBlock.className = 'project-detail-block';
          const h = document.createElement('h4');
          h.textContent = i18n.t('projects.docs');
          const wrap = document.createElement('div');
          wrap.className = 'project-docs';
          const parts = String(docs)
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean);
          (parts.length ? parts : [String(docs).trim()]).forEach((part) => {
            const p = document.createElement('p');
            p.innerHTML = linkifyDocs(part);
            wrap.appendChild(p);
          });
          docsBlock.appendChild(h);
          docsBlock.appendChild(wrap);
          detail.appendChild(docsBlock);
        }

        const hasQrShots = detailShots.some((s) => /^QR\s/i.test(s.label || ''));
        if (hasQrShots) {
          const stickers = document.createElement('div');
          stickers.className = 'project-detail-block';
          const h = document.createElement('h4');
          h.textContent = i18n.t('projects.stickers');
          const row = document.createElement('div');
          row.className = 'project-files';
          const mesa = document.createElement('a');
          mesa.className = 'btn btn-ghost';
          mesa.href = '/demos/qr-bares/mesa';
          mesa.target = '_blank';
          mesa.rel = 'noopener';
          mesa.textContent = i18n.t('projects.stickerTable');
          const enc = document.createElement('a');
          enc.className = 'btn btn-ghost';
          enc.href = '/demos/qr-bares/encargado';
          enc.target = '_blank';
          enc.rel = 'noopener';
          enc.textContent = i18n.t('projects.stickerStaff');
          row.appendChild(mesa);
          row.appendChild(enc);
          stickers.appendChild(h);
          stickers.appendChild(row);
          detail.appendChild(stickers);
        }

        if (detailShots.length) {
          const shotsBlock = document.createElement('div');
          shotsBlock.className = 'project-detail-block';
          const h = document.createElement('h4');
          h.textContent = i18n.t('projects.shots');
          const qrCount = detailShots.filter((s) => /^QR\s/i.test(s.label || '')).length;
          const grid = document.createElement('div');
          grid.className = `project-shots${qrCount >= 2 ? ' project-shots--qr' : ''}`;
          detailShots.forEach((shot) => {
            const isQr = /^QR\s/i.test(shot.label || '');
            const link = document.createElement('a');
            link.href = shot.file_url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = `project-shot${isQr ? ' project-shot--qr' : ''}`;
            const img = document.createElement('img');
            img.src = shot.file_url;
            img.alt = shot.label || title;
            img.loading = 'lazy';
            link.appendChild(img);
            if (shot.label) {
              const cap = document.createElement('span');
              cap.textContent = shot.label;
              link.appendChild(cap);
            }
            grid.appendChild(link);
          });
          shotsBlock.appendChild(h);
          shotsBlock.appendChild(grid);
          detail.appendChild(shotsBlock);
        }

        if (files.length) {
          const filesBlock = document.createElement('div');
          filesBlock.className = 'project-detail-block';
          const h = document.createElement('h4');
          h.textContent = i18n.t('projects.files');
          const list = document.createElement('div');
          list.className = 'project-files';
          files.forEach((file) => {
            const a = document.createElement('a');
            a.className = 'btn btn-ghost';
            a.href = file.file_url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = `${file.label || i18n.t('projects.download')}`;
            list.appendChild(a);
          });
          filesBlock.appendChild(h);
          filesBlock.appendChild(list);
          detail.appendChild(filesBlock);
        }

        if (!docs && !detailShots.length && !files.length) {
          const empty = document.createElement('p');
          empty.className = 'empty-state';
          empty.textContent = desc || title;
          detail.appendChild(empty);
        }

        article.appendChild(detail);
      }

      els.projectList.appendChild(article);
    });
    observeReveals();
  }

  function renderCerts() {
    const items = data.certificates || [];
    els.certList.innerHTML = '';
    els.certsEmpty.hidden = items.length > 0;

    items.forEach((cert, index) => {
      const article = document.createElement('article');
      article.className = 'cert-item reveal is-visible';
      const delay = Math.min(index, 4);
      if (delay) article.classList.add(`reveal-delay-${delay}`);

      const title = i18n.pick(cert.title_es, cert.title_en);
      const metaParts = [cert.issuer, cert.issued_at].filter((part) => String(part || '').trim());
      const meta = metaParts.join(' · ');

      const copy = document.createElement('div');
      copy.className = 'cert-copy';
      copy.innerHTML = `<h3 class="cert-title"></h3><p class="cert-meta"></p>`;
      copy.querySelector('.cert-title').textContent = title;
      const metaEl = copy.querySelector('.cert-meta');
      if (meta) {
        metaEl.textContent = meta;
      } else {
        metaEl.remove();
      }

      const actions = document.createElement('div');
      actions.className = 'item-actions';
      if (cert.file_url) {
        const a = document.createElement('a');
        a.className = 'btn btn-ghost';
        a.href = cert.file_url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = i18n.t('certificates.open');
        actions.appendChild(a);
      }

      article.appendChild(copy);
      article.appendChild(actions);
      els.certList.appendChild(article);
    });
    observeReveals();
  }

  function renderContact() {
    const p = data.profile || {};
    els.contactRow.innerHTML = '';
    els.contactRow.className = 'contact-panel';

    const icons = {
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>',
      github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3.2-.4 6.5-1.6 6.5-7.2a5.6 5.6 0 0 0-1.5-3.9 5.2 5.2 0 0 0-.1-3.8S17.3-.2 14.8 1.7a12.6 12.6 0 0 0-6.6 0C5.7-.2 4.1 1 4.1 1a5.2 5.2 0 0 0-.1 3.8 5.6 5.6 0 0 0-1.5 3.9c0 5.6 3.3 6.8 6.5 7.2a4.8 4.8 0 0 0-1 3.2v4"/><path d="M9 18c-4 1.2-4-2-6-2"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><path d="M2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>'
    };

    if (p.email) {
      const cta = document.createElement('a');
      cta.className = 'btn btn-primary contact-cta';
      cta.href = `mailto:${p.email}`;
      cta.textContent = i18n.t('contact.cta');
      els.contactRow.appendChild(cta);
    }

    const channels = document.createElement('div');
    channels.className = 'contact-channels';

    function addChannel({ href, label, svg, external }) {
      const a = document.createElement('a');
      a.className = 'contact-channel';
      a.href = href;
      a.setAttribute('aria-label', label);
      if (external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.innerHTML = `${svg}<span class="contact-channel__label"></span>`;
      a.querySelector('.contact-channel__label').textContent = label;
      channels.appendChild(a);
    }

    if (p.phone) {
      addChannel({
        href: `tel:${String(p.phone).replace(/[^\d+]/g, '')}`,
        label: i18n.t('contact.phone'),
        svg: icons.phone
      });
    }
    if (p.github) {
      addChannel({
        href: p.github,
        label: i18n.t('contact.github'),
        svg: icons.github,
        external: true
      });
    }
    if (p.linkedin) {
      addChannel({
        href: p.linkedin,
        label: i18n.t('contact.linkedin'),
        svg: icons.linkedin,
        external: true
      });
    }

    if (channels.childElementCount) {
      els.contactRow.appendChild(channels);
    }

    const location = i18n.pick(p.location_pref_es, p.location_pref_en);
    if (location) {
      const avail = document.createElement('p');
      avail.className = 'contact-availability';
      avail.innerHTML = `<span class="contact-availability__label"></span> <span class="contact-availability__text"></span>`;
      avail.querySelector('.contact-availability__label').textContent = `${i18n.t('contact.location')}:`;
      avail.querySelector('.contact-availability__text').textContent = location;
      els.contactRow.appendChild(avail);
    }
  }

  let langBusy = false;

  function swapLanguage(nextLang) {
    if (langBusy || i18n.lang === nextLang) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const surfaces = [document.querySelector('main'), document.querySelector('.site-footer')].filter(Boolean);
    const toggles = document.querySelectorAll('.lang-toggle');

    const apply = () => {
      i18n.setLang(nextLang);
      syncLangQuery(nextLang);
      render();
    };

    if (reduce) {
      apply();
      return;
    }

    langBusy = true;
    toggles.forEach((el) => el.classList.add('is-switching'));
    surfaces.forEach((el) => {
      el.classList.add('lang-swap', 'is-exiting');
      el.classList.remove('is-entering');
    });

    window.setTimeout(() => {
      apply();
      surfaces.forEach((el) => {
        el.classList.remove('is-exiting');
        el.classList.add('lang-swap', 'is-entering');
      });
      window.setTimeout(() => {
        surfaces.forEach((el) => el.classList.remove('is-entering'));
        toggles.forEach((el) => el.classList.remove('is-switching'));
        langBusy = false;
      }, 380);
    }, 180);
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      swapLanguage(btn.dataset.lang);
    });
  });

  els.navToggle?.addEventListener('click', () => {
    const open = els.nav.classList.toggle('is-open');
    els.navToggle.setAttribute('aria-expanded', String(open));
  });

  els.nav?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      els.nav.classList.remove('is-open');
      els.navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  async function load() {
    try {
      const res = await fetch('/api/portfolio', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Failed');
      data = await res.json();
    } catch {
      data = {
        profile: {
          name: 'Iván Martín Molina',
          tagline_es: 'Desarrollo apps y webs',
          tagline_en: 'I build apps and websites',
          about_es: 'Tengo 20 años, soy de Almería y estudio el Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM). Combino lo del aula con proyectos propios: webs, apps móviles y herramientas en la nube.\n\nAprendo rápido aplicando lo que estudio a productos reales. Me interesa el desarrollo de software y seguir creciendo con proyectos y equipos.',
          about_en: 'I\'m 20, from Almería (Spain), and I study Higher Vocational Training in Multiplatform Application Development (DAM). I combine coursework with my own projects: websites, mobile apps and cloud tools.\n\nI learn by shipping real products. I want to grow as a software developer through projects and teamwork.',
          location_pref_es: 'Remoto y abierto a moverme fuera de España.',
          location_pref_en: 'Remote-friendly and open to relocating outside Spain.',
          email: 'ivanmarrtin2703@gmail.com',
          github: 'https://github.com/ivanmarrtin27',
          linkedin: 'https://www.linkedin.com/in/iván-martín-molina-34b652432/'
        },
        projects: [
          {
            id: 'fallback-qr',
            title_es: 'Carta digital QR para bares',
            title_en: 'QR digital menu for bars',
            description_es:
              'Carta pública + panel del encargado con pegatinas QR. Ejemplo real: Bar Lo Güeno.',
            description_en:
              'Public menu + staff panel with QR stickers. Real example: Bar Lo Güeno.',
            docs_es:
              'Producto propio para locales: el cliente escanea el QR de mesa y ve la carta; el encargado gestiona platos y disponibilidad desde su panel.\n\nCarta del cliente: https://mi-carta.pages.dev/?bar=lo-gueno\nPanel del encargado: https://mi-carta.pages.dev/admin.html?bar=lo-gueno\nPIN de prueba del panel del encargado: 9999\n\nDemos de pegatinas QR en este portfolio:\nQR mesa: /demos/qr-bares/mesa\nQR encargado: /demos/qr-bares/encargado',
            docs_en:
              'Own product for venues: guests scan the table QR to open the menu; staff manage dishes and availability from their panel.\n\nCustomer menu: https://mi-carta.pages.dev/?bar=lo-gueno\nStaff panel: https://mi-carta.pages.dev/admin.html?bar=lo-gueno\nStaff panel demo PIN: 9999\n\nQR sticker demos on this portfolio:\nTable QR: /demos/qr-bares/mesa\nStaff QR: /demos/qr-bares/encargado',
            tech: 'Cloudflare Pages, Functions, D1, HTML, CSS, JavaScript',
            live_url: 'https://mi-carta.pages.dev/?bar=lo-gueno',
            repo_url: '',
            image_url: '/assets/projects/qr-bares/logo.png',
            assets: [
              {
                id: 'fb-qr-mesa',
                kind: 'screenshot',
                label: 'QR mesa',
                file_url: '/assets/demos/qr-bares/qr-mesa.png',
                file_type: 'image',
                sort_order: 0
              },
              {
                id: 'fb-qr-encargado',
                kind: 'screenshot',
                label: 'QR encargado',
                file_url: '/assets/demos/qr-bares/qr-encargado.png',
                file_type: 'image',
                sort_order: 1
              }
            ],
            sort_order: 0
          },
          {
            id: 'fallback-klaro',
            title_es: 'Klaro-Chat Bot',
            title_en: 'Klaro-Chat Bot',
            description_es:
              'En desarrollo. Producto propio: recepcionista con IA por WhatsApp para negocios con cita. Responde, agenda y recuerda; ahora en piloto.',
            description_en:
              'In development. Own product: AI WhatsApp receptionist for appointment businesses. Replies, books and reminds; currently in pilot.',
            docs_es:
              'Lo empecé porque muchos locales pierden mensajes fuera de horario o mientras atienden. Quería un recepcionista que viviera donde ya escriben los clientes — WhatsApp — sin obligar al local a montar otra app ni a configurarlo todo solo.\n\nKlaro responde precios y horarios, agenda citas y recuerda al cliente. Incluye landing de captación, bot multi-local con menús interactivos (servicio → día → hora → confirmar), panel agency y panel Hoy para ver la agenda del día. La IA tiene fallback por reglas si el proveedor falla.\n\nStack: Cloudflare Pages, Functions, D1, JavaScript y WhatsApp Cloud API. Modelo agency managed: yo configuro cada negocio. Ahora mismo en piloto.\nLanding en vivo: https://klaroapp.pages.dev\nProbar chat: https://klaroapp.pages.dev/demo/\nCódigo: https://github.com/ivanmarrtin2703/Klaro-Chat-Bot\nDemo en este portfolio: /demos/citaclara/',
            docs_en:
              'I started it because many shops miss messages after hours or while serving clients. I wanted a receptionist that lives where clients already write — WhatsApp — without forcing the shop to install another app or configure everything alone.\n\nKlaro handles prices and hours, books appointments and sends reminders. It includes a lead landing, a multi-location bot with interactive menus (service → day → time → confirm), an agency panel and a Hoy panel for the day\'s agenda. The AI has a rule-based fallback if the provider fails.\n\nStack: Cloudflare Pages, Functions, D1, JavaScript and WhatsApp Cloud API. Agency-managed model: I configure each business. Currently in pilot.\nLive landing: https://klaroapp.pages.dev\nTry chat: https://klaroapp.pages.dev/demo/\nCode: https://github.com/ivanmarrtin2703/Klaro-Chat-Bot\nDemo on this portfolio: /demos/citaclara/',
            tech: 'Cloudflare Pages, Functions, D1, JavaScript, WhatsApp Cloud API',
            live_url: 'https://klaroapp.pages.dev',
            repo_url: 'https://github.com/ivanmarrtin2703/Klaro-Chat-Bot',
            image_url: '/assets/projects/citaclara/klaro-logo.png',
            assets: [],
            sort_order: 1
          },
          {
            id: 'fallback-houdini',
            title_es: 'Houdini Analytics v1.1',
            title_en: 'Houdini Analytics v1.1',
            description_es:
              'App de predicciones de fútbol (Houdini Analytics v1.1) con modelo Poisson: tips, probabilidades y cuotas orientativas para ligas top europeas. En desarrollo activo sobre Cloudflare (Worker + D1).',
            description_en:
              'Football predictions app (Houdini Analytics v1.1) with a Poisson model: tips, probabilities and indicative odds for top European leagues. Active development on Cloudflare (Worker + D1).',
            docs_es:
              'Versión: v1.1 (Houdini Analytics).\n\nEstado: en desarrollo (MVP usable en pages.dev).\n\nNota: la URL actual (.pages.dev / .dev) es temporal mientras desarrollo; más adelante tendrá dominio propio (.es o .com).\n\nStack: Cloudflare Workers, D1, UI HTML/CSS/JS (PWA), sync de fixtures/odds.\n\nFeatures: Partidos (hoy/live), Top 10 del día, Aciertos / Stats de tips, explorador de Ligas con clasificaciones.\n\nModelo: Poisson + mercados 1X2 / O-U / BTTS / extras; value cuando hay book. Los tips son orientativos; no garantizan acierto ni beneficio.\n\nRoadmap (cuando el producto esté completo):\n1) Registro + login\n2) Planes Premium con suscripción / pago\n3) Dominio propio (.es o .com) cuando el producto esté completo\n\nDemo: https://houdini-analytics.pages.dev\nCódigo: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
            docs_en:
              'Version: v1.1 (Houdini Analytics).\n\nStatus: in development (usable MVP on pages.dev).\n\nNote: the current .pages.dev / .dev URL is temporary during development; a proper .es or .com domain will come later.\n\nStack: Cloudflare Workers, D1, HTML/CSS/JS UI (PWA), fixture/odds sync.\n\nFeatures: Matches (today/live), daily Top 10, Hits / tip Stats, Leagues explorer with standings.\n\nModel: Poisson + 1X2 / O-U / BTTS / extras; value when book odds exist. Tips are indicative; they do not guarantee hits or profit.\n\nRoadmap (once the product is complete):\n1) Sign-up + login\n2) Premium plans with subscription / payment\n3) Custom domain (.es or .com) once the product is complete\n\nDemo: https://houdini-analytics.pages.dev\nCode: https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
            tech: 'Cloudflare Workers, D1, JavaScript, PWA',
            live_url: 'https://houdini-analytics.pages.dev',
            repo_url: 'https://github.com/ivanmarrtin27/Houdini-Analytics-v1.1',
            image_url: '/assets/projects/houdini-bet/logo.png',
            assets: [],
            sort_order: 10
          },
          {
            id: 'fallback-melodix',
            title_es: 'Melodix',
            title_en: 'Melodix',
            description_es:
              'En desarrollo. App de música personal creada a medida, sin depender de grandes suscripciones y con la meta de publicarla en Play Store.',
            description_en:
              'In development. A custom personal music app, independent from major subscriptions and intended for a future Play Store release.',
            docs_es:
              'Base funcional construida con React, Vite y PWA en el frontend, y FastAPI en el backend.\n\nDemo: /demos/melodix/\nCódigo: https://github.com/ivanmarrtin2703/Melodix-v1',
            docs_en:
              'Working foundation built with React, Vite and PWA on the frontend, and FastAPI on the backend.\n\nDemo: /demos/melodix/\nCode: https://github.com/ivanmarrtin2703/Melodix-v1',
            tech: 'React, Vite, PWA, FastAPI',
            live_url: '/demos/melodix/',
            repo_url: 'https://github.com/ivanmarrtin2703/Melodix-v1',
            image_url: '/assets/projects/melodix/logo.png',
            assets: [],
            sort_order: 20
          },
          {
            id: 'fallback-ovisoft',
            title_es: 'Ovisoft · Programa de IA',
            title_en: 'Ovisoft · AI program',
            description_es:
              'En desarrollo. Prototipo de vídeo marketing automatizado: de productos y palabras clave a piezas para Instagram y TikTok.',
            description_en:
              'In development. Automated video marketing prototype: from products and keywords to content for Instagram and TikTok.',
            docs_es:
              'Propuesta para ayudar a empresas a generar contenido corto para redes. La demo muestra el enfoque de interfaz; el producto no está terminado.\n\nDemo UI: /demos/ovisoft/',
            docs_en:
              'A proposal to help companies generate short-form social content. The demo shows the interface direction; the product is unfinished.\n\nUI demo: /demos/ovisoft/',
            tech: 'Angular, TypeScript, Node, Express',
            live_url: '/demos/ovisoft/',
            repo_url: '',
            image_url: '/assets/projects/ovisoft/logo.png',
            assets: [],
            sort_order: 30
          },
          {
            id: 'fallback-quedada',
            title_es: 'Quedada',
            title_en: 'Quedada',
            description_es:
              'En desarrollo. App móvil que reúne juegos de fiesta para amigos. Actualmente en testing de Play Console.',
            description_en:
              'In development. Mobile app bringing together party games for friends. Currently in Play Console testing.',
            docs_es:
              'Incluye cinco modos de juego, contenido por categorías, identidad propia y anuncios interstitial con cooldown.\n\nPolítica de privacidad: https://ivanmarrtin2703.github.io/quedada-privacy/',
            docs_en:
              'It includes five game modes, categorized content, custom branding and cooldown-based interstitial ads.\n\nPrivacy policy: https://ivanmarrtin2703.github.io/quedada-privacy/',
            tech: 'Expo, React Native, TypeScript',
            live_url: 'https://ivanmarrtin2703.github.io/quedada-privacy/',
            repo_url: 'https://github.com/ivanmarrtin2703/Quedada',
            image_url: '/assets/projects/quedada/logo.png',
            assets: [],
            sort_order: 40
          }
        ],
        certificates: [
          {
            id: 'fb-cert-ionic',
            title_es: 'Desarrollo de aplicaciones móviles con Ionic y Angular',
            title_en: 'Mobile application development with Ionic and Angular',
            issuer: 'Acciogest Digital, S.L.',
            issued_at: '40 h',
            file_url: '/assets/certificates/ionic-angular-curso-40h.pdf',
            file_type: 'pdf',
            sort_order: 10
          },
          {
            id: 'fb-cert-odoo',
            title_es: 'Configuración y administración de Odoo',
            title_en: 'Odoo configuration and administration',
            issuer: 'Ovisoft Telecom Center',
            issued_at: '40 h',
            file_url: '/assets/certificates/odoo-curso-40h.pdf',
            file_type: 'pdf',
            sort_order: 20
          },
          {
            id: 'fb-cert-rn',
            title_es: 'Desarrollo multiplataforma con React Native',
            title_en: 'Cross-platform development with React Native',
            issuer: 'I.E.S. La Puebla',
            issued_at: '40 h',
            file_url: '/assets/certificates/react-native-curso-40h.pdf',
            file_type: 'pdf',
            sort_order: 30
          },
          {
            id: 'fb-cert-unity',
            title_es: 'Desarrollo multiplataforma con Unity3D',
            title_en: 'Cross-platform development with Unity3D',
            issuer: 'I.E.S. La Puebla',
            issued_at: '40 h',
            file_url: '/assets/certificates/unity-curso-40h.pdf',
            file_type: 'pdf',
            sort_order: 40
          },
          {
            id: 'fb-cert-mongo',
            title_es: 'Curso de MongoDB: Creación y gestión de bases de datos NoSQL',
            title_en: 'MongoDB Course: Creating and managing NoSQL databases',
            issuer: 'OpenWebinars',
            issued_at: '8 h',
            file_url: '/assets/certificates/mongodb-nosql.pdf',
            file_type: 'pdf',
            sort_order: 50
          },
          {
            id: 'fb-cert-crud',
            title_es: 'Curso de Java y MySQL JDBC: Elaboración de un CRUD',
            title_en: 'Java and MySQL JDBC Course: Building a CRUD',
            issuer: 'OpenWebinars',
            issued_at: '5 h',
            file_url: '/assets/certificates/java-mysql-jdbc-crud.pdf',
            file_type: 'pdf',
            sort_order: 60
          },
          {
            id: 'fb-cert-ops',
            title_es: 'Curso de Java y MySQL JDBC: Operaciones básicas',
            title_en: 'Java and MySQL JDBC Course: Basic operations',
            issuer: 'OpenWebinars',
            issued_at: '4 h',
            file_url: '/assets/certificates/java-mysql-jdbc-operaciones.pdf',
            file_type: 'pdf',
            sort_order: 70
          },
          {
            id: 'fb-cert-tx',
            title_es: 'Curso de Java y MySQL JDBC: Procedimientos almacenados y transacciones ACID',
            title_en: 'Java and MySQL JDBC Course: Stored procedures and ACID transactions',
            issuer: 'OpenWebinars',
            issued_at: '4 h',
            file_url: '/assets/certificates/java-mysql-jdbc-transacciones.pdf',
            file_type: 'pdf',
            sort_order: 80
          },
          {
            id: 'fb-cert-ia',
            title_es: 'Curso de Iniciación al Desarrollo con IA',
            title_en: 'Introduction to AI Development Course',
            issuer: 'Big School',
            issued_at: '4 h',
            file_url: '/assets/certificates/big-school-desarrollo-ia.pdf',
            file_type: 'pdf',
            sort_order: 90
          }
        ]
      };
    }
    render();
  }

  function initLanguageFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('lang');
      if (q === 'en' || q === 'es') {
        i18n.setLang(q);
        return;
      }
    } catch {
      /* ignore */
    }
    i18n.setLang(i18n.lang);
  }

  initLanguageFromUrl();
  initMotion();
  load();
})();
