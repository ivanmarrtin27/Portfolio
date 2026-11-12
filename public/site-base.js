(() => {
  function base() {
    try {
      const first = location.pathname.split('/').filter(Boolean)[0];
      if (first === 'portfolio') return '/portfolio';
    } catch {
      /* ignore */
    }
    return '';
  }

  function url(path) {
    if (path == null || path === '') return path;
    const value = String(path);
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(value)) return value;
    if (value.startsWith('/')) return `${base()}${value}`;
    return value;
  }

  window.PortfolioSite = { base, url };
})();
