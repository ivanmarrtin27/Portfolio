(() => {
  const pinScreen = document.getElementById('pinScreen');
  const adminApp = document.getElementById('adminApp');
  const pinForm = document.getElementById('pinForm');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinError');
  const toast = document.getElementById('toast');

  let state = {
    profile: null,
    projects: [],
    certificates: []
  };

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  async function api(url, options = {}) {
    const res = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function openAdmin() {
    pinScreen.classList.add('is-hidden');
    adminApp.classList.add('is-open');
  }

  function closeAdmin() {
    adminApp.classList.remove('is-open');
    pinScreen.classList.remove('is-hidden');
    pinInput.value = '';
  }

  async function checkSession() {
    try {
      await api('/api/admin/session');
      openAdmin();
      await refreshAll();
    } catch {
      closeAdmin();
    }
  }

  pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    pinError.textContent = '';
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ pin: pinInput.value })
      });
      openAdmin();
      await refreshAll();
      showToast('Sesión iniciada');
    } catch (err) {
      pinError.textContent = err.message || 'PIN incorrecto';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await api('/api/admin/logout', { method: 'POST' }); } catch { /* ignore */ }
    closeAdmin();
  });

  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('is-active'));
      document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('is-active');
    });
  });

  async function refreshAll() {
    const portfolio = await api('/api/portfolio');
    state.profile = portfolio.profile;
    state.projects = portfolio.projects || [];
    state.certificates = portfolio.certificates || [];
    fillProfileForm();
    renderProjects();
    renderCerts();
    updateCvPreview();
  }

  function fillProfileForm() {
    const p = state.profile || {};
    const form = document.getElementById('profileForm');
    form.name.value = p.name || '';
    form.tagline_es.value = p.tagline_es || '';
    form.tagline_en.value = p.tagline_en || '';
    form.about_es.value = p.about_es || '';
    form.about_en.value = p.about_en || '';
    form.youtube_url.value = p.youtube_url || '';
    form.email.value = p.email || '';
    form.phone.value = p.phone || '';
    form.github.value = p.github || '';
    form.instagram.value = p.instagram || '';
    form.linkedin.value = p.linkedin || '';
    form.location_pref_es.value = p.location_pref_es || '';
    form.location_pref_en.value = p.location_pref_en || '';
  }

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const data = await api('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name.value,
          tagline_es: form.tagline_es.value,
          tagline_en: form.tagline_en.value,
          about_es: form.about_es.value,
          about_en: form.about_en.value,
          youtube_url: form.youtube_url.value,
          email: form.email.value,
          phone: form.phone.value,
          github: form.github.value,
          instagram: form.instagram.value,
          linkedin: form.linkedin.value,
          location_pref_es: form.location_pref_es.value,
          location_pref_en: form.location_pref_en.value
        })
      });
      state.profile = data.profile;
      showToast('Perfil guardado');
    } catch (err) {
      showToast(err.message);
    }
  });

  function resetProjectForm() {
    const form = document.getElementById('projectForm');
    form.reset();
    form.id.value = '';
    document.getElementById('projectFormTitle').textContent = 'Nuevo proyecto';
    document.getElementById('projectAssetsPanel').classList.add('hidden');
    document.getElementById('projectAssetsList').innerHTML = '';
  }

  document.getElementById('projectReset').addEventListener('click', resetProjectForm);

  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value;
    const payload = {
      title_es: form.title_es.value,
      title_en: form.title_en.value,
      description_es: form.description_es.value,
      description_en: form.description_en.value,
      docs_es: form.docs_es.value,
      docs_en: form.docs_en.value,
      tech: form.tech.value,
      live_url: form.live_url.value,
      repo_url: form.repo_url.value,
      sort_order: Number(form.sort_order.value || 0)
    };

    try {
      let project;
      if (id) {
        const data = await api(`/api/admin/projects/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        project = data.project;
      } else {
        const data = await api('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        project = data.project;
      }

      const image = form.project_image.files[0];
      if (image && project?.id) {
        const fd = new FormData();
        fd.append('file', image);
        fd.append('purpose', 'project');
        fd.append('project_id', String(project.id));
        await api('/api/admin/upload', { method: 'POST', body: fd });
      }

      showToast('Proyecto guardado');
      await refreshAll();
      const fresh = state.projects.find((p) => p.id === project.id) || project;
      editProject(fresh);
    } catch (err) {
      showToast(err.message);
    }
  });

  function renderProjectAssets(project) {
    const panel = document.getElementById('projectAssetsPanel');
    const list = document.getElementById('projectAssetsList');
    if (!project?.id) {
      panel.classList.add('hidden');
      list.innerHTML = '';
      return;
    }
    panel.classList.remove('hidden');
    panel.dataset.projectId = String(project.id);
    list.innerHTML = '';
    const assets = project.assets || [];
    if (!assets.length) {
      list.innerHTML = '<p class="empty-state">Sin capturas ni archivos todavía.</p>';
      return;
    }
    assets.forEach((asset) => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      item.innerHTML = `
        <div class="admin-item-head">
          <div>
            <strong></strong>
            <div class="admin-item-meta"></div>
          </div>
          <div class="form-actions">
            <a class="btn btn-ghost" target="_blank" rel="noopener" data-open>Abrir</a>
            <button class="btn btn-danger" type="button" data-del>Eliminar</button>
          </div>
        </div>
      `;
      item.querySelector('strong').textContent = asset.label || asset.kind;
      item.querySelector('.admin-item-meta').textContent = `${asset.kind} · ${asset.file_type}`;
      const open = item.querySelector('[data-open]');
      if (asset.file_url) open.href = asset.file_url;
      else open.classList.add('hidden');
      item.querySelector('[data-del]').addEventListener('click', () => deleteAsset(project.id, asset.id));
      list.appendChild(item);
    });
  }

  document.getElementById('assetUploadBtn').addEventListener('click', async () => {
    const panel = document.getElementById('projectAssetsPanel');
    const projectId = panel.dataset.projectId;
    const fileInput = document.getElementById('asset_file');
    const file = fileInput.files[0];
    if (!projectId) {
      showToast('Guarda el proyecto primero');
      return;
    }
    if (!file) {
      showToast('Elige un archivo');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'project_asset');
      fd.append('project_id', projectId);
      fd.append('kind', document.getElementById('asset_kind').value);
      fd.append('label', document.getElementById('asset_label').value);
      await api('/api/admin/upload', { method: 'POST', body: fd });
      showToast('Archivo subido');
      fileInput.value = '';
      document.getElementById('asset_label').value = '';
      await refreshAll();
      const fresh = state.projects.find((p) => String(p.id) === String(projectId));
      if (fresh) renderProjectAssets(fresh);
    } catch (err) {
      showToast(err.message);
    }
  });

  async function deleteAsset(projectId, assetId) {
    if (!confirm('¿Eliminar este archivo?')) return;
    try {
      await api(`/api/admin/projects/${projectId}/assets/${assetId}`, { method: 'DELETE' });
      showToast('Archivo eliminado');
      await refreshAll();
      const fresh = state.projects.find((p) => p.id === projectId);
      if (fresh) renderProjectAssets(fresh);
    } catch (err) {
      showToast(err.message);
    }
  }

  function renderProjects() {
    const root = document.getElementById('projectsAdminList');
    root.innerHTML = '';
    if (!state.projects.length) {
      root.innerHTML = '<p class="empty-state">No hay proyectos todavía.</p>';
      return;
    }

    state.projects.forEach((project) => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      const assetCount = (project.assets || []).length;
      item.innerHTML = `
        <div class="admin-item-head">
          <div>
            <strong></strong>
            <div class="admin-item-meta"></div>
          </div>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" data-edit>Editar</button>
            <button class="btn btn-danger" type="button" data-del>Eliminar</button>
          </div>
        </div>
      `;
      item.querySelector('strong').textContent = project.title_es;
      item.querySelector('.admin-item-meta').textContent =
        `${project.tech || project.title_en || ''}${assetCount ? ` · ${assetCount} adjuntos` : ''}`;
      item.querySelector('[data-edit]').addEventListener('click', () => editProject(project));
      item.querySelector('[data-del]').addEventListener('click', () => deleteProject(project.id));
      root.appendChild(item);
    });
  }

  function editProject(project) {
    const form = document.getElementById('projectForm');
    document.getElementById('projectFormTitle').textContent = 'Editar proyecto';
    form.id.value = project.id;
    form.title_es.value = project.title_es || '';
    form.title_en.value = project.title_en || '';
    form.description_es.value = project.description_es || '';
    form.description_en.value = project.description_en || '';
    form.docs_es.value = project.docs_es || '';
    form.docs_en.value = project.docs_en || '';
    form.tech.value = project.tech || '';
    form.live_url.value = project.live_url || '';
    form.repo_url.value = project.repo_url || '';
    form.sort_order.value = project.sort_order ?? 0;
    renderProjectAssets(project);
    document.querySelector('[data-tab="projects"]').click();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function deleteProject(id) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await api(`/api/admin/projects/${id}`, { method: 'DELETE' });
      showToast('Proyecto eliminado');
      await refreshAll();
    } catch (err) {
      showToast(err.message);
    }
  }

  function resetCertForm() {
    const form = document.getElementById('certForm');
    form.reset();
    form.id.value = '';
    document.getElementById('certFormTitle').textContent = 'Nuevo certificado';
  }

  function guessFileType(path) {
    const lower = String(path || '').toLowerCase();
    if (/\.(png|jpe?g|webp|gif)$/.test(lower)) return 'image';
    return 'pdf';
  }

  function normalizeAssetPath(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';
    if (value.startsWith('/assets/')) return value;
    if (value.startsWith('assets/')) return `/${value}`;
    throw new Error('La ruta debe empezar por /assets/…');
  }

  document.getElementById('certReset').addEventListener('click', resetCertForm);

  document.getElementById('certForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value;
    const file = form.file.files[0];
    const staticPath = form.file_key.value.trim();

    try {
      let fileKey = null;
      let fileType = 'pdf';

      if (staticPath) {
        fileKey = normalizeAssetPath(staticPath);
        fileType = guessFileType(fileKey);
      } else if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('purpose', 'certificate');
        if (id) fd.append('certificate_id', id);
        const uploaded = await api('/api/admin/upload', { method: 'POST', body: fd });
        fileKey = uploaded.key;
        fileType = uploaded.file_type;
      }

      const payload = {
        title_es: form.title_es.value,
        title_en: form.title_en.value,
        issuer: form.issuer.value,
        issued_at: form.issued_at.value,
        sort_order: Number(form.sort_order.value || 0)
      };

      if (id) {
        if (fileKey) {
          payload.file_key = fileKey;
          payload.file_type = fileType;
        }
        await api(`/api/admin/certificates/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        if (!fileKey) {
          throw new Error('Pega una ruta /assets/certificates/… o copia el archivo ahí y vuelve a guardar');
        }
        payload.file_key = fileKey;
        payload.file_type = fileType;
        await api('/api/admin/certificates', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      showToast('Certificado guardado');
      resetCertForm();
      await refreshAll();
    } catch (err) {
      showToast(err.message);
    }
  });

  function renderCerts() {
    const root = document.getElementById('certsAdminList');
    root.innerHTML = '';
    if (!state.certificates.length) {
      root.innerHTML = '<p class="empty-state">No hay certificados todavía.</p>';
      return;
    }

    state.certificates.forEach((cert) => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      item.innerHTML = `
        <div class="admin-item-head">
          <div>
            <strong></strong>
            <div class="admin-item-meta"></div>
          </div>
          <div class="form-actions">
            <a class="btn btn-ghost" target="_blank" rel="noopener" data-open>Abrir</a>
            <button class="btn btn-ghost" type="button" data-edit>Editar</button>
            <button class="btn btn-danger" type="button" data-del>Eliminar</button>
          </div>
        </div>
      `;
      item.querySelector('strong').textContent = cert.title_es;
      item.querySelector('.admin-item-meta').textContent =
        [cert.issuer, cert.issued_at].filter(Boolean).join(' · ');
      const open = item.querySelector('[data-open]');
      if (cert.file_url) open.href = cert.file_url;
      else open.classList.add('hidden');
      item.querySelector('[data-edit]').addEventListener('click', () => editCert(cert));
      item.querySelector('[data-del]').addEventListener('click', () => deleteCert(cert.id));
      root.appendChild(item);
    });
  }

  function editCert(cert) {
    const form = document.getElementById('certForm');
    document.getElementById('certFormTitle').textContent = 'Editar certificado';
    form.id.value = cert.id;
    form.title_es.value = cert.title_es || '';
    form.title_en.value = cert.title_en || '';
    form.issuer.value = cert.issuer || '';
    form.issued_at.value = cert.issued_at || '';
    form.sort_order.value = cert.sort_order ?? 0;
    form.file_key.value = cert.file_key || '';
    document.querySelector('[data-tab="certificates"]').click();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function deleteCert(id) {
    if (!confirm('¿Eliminar este certificado?')) return;
    try {
      await api(`/api/admin/certificates/${id}`, { method: 'DELETE' });
      showToast('Certificado eliminado');
      await refreshAll();
    } catch (err) {
      showToast(err.message);
    }
  }

  function updateCvPreview() {
    const preview = document.getElementById('cvPreview');
    const input = document.getElementById('cv_key');
    if (state.profile?.cv_key && input && !input.value) {
      input.value = state.profile.cv_key;
    }
    if (state.profile?.cv_url) {
      preview.classList.remove('hidden');
      preview.href = state.profile.cv_url;
    } else {
      preview.classList.add('hidden');
    }
  }

  document.getElementById('cvForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const cvKey = normalizeAssetPath(form.cv_key.value);
      const profilePayload = {
        name: state.profile?.name || 'Iván Martín Molina',
        tagline_es: state.profile?.tagline_es || '',
        tagline_en: state.profile?.tagline_en || '',
        about_es: state.profile?.about_es || '',
        about_en: state.profile?.about_en || '',
        youtube_url: state.profile?.youtube_url || '',
        email: state.profile?.email || '',
        phone: state.profile?.phone || '',
        github: state.profile?.github || '',
        instagram: state.profile?.instagram || '',
        linkedin: state.profile?.linkedin || '',
        location_pref_es: state.profile?.location_pref_es || '',
        location_pref_en: state.profile?.location_pref_en || '',
        cv_key: cvKey
      };
      const data = await api('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(profilePayload)
      });
      state.profile = data.profile;
      updateCvPreview();
      showToast('Ruta del CV guardada. Despliega si el PDF es nuevo en public/assets/cv/');
    } catch (err) {
      showToast(err.message);
    }
  });

  checkSession();
})();
