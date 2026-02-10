/* eslint-disable no-unused-vars */
(() => {
  /**
   * Static launcher/updater home page (890x456).
   * Meant to be loaded inside Qt WebEngineView.
   *
   * Qt can update UI with:
   *  - window.vortex.setSubtitle("...")
   *  - window.vortex.setVersion("v1.2.3")
   *  - window.vortex.setServerStatus({ ok: true, text: "Online • 123 players" })
   *  - window.vortex.setNews({ featuredIndex: 0, items: [...] })
   */

  // Keep this file compatible with Qt 5.12's QtWebEngine (old Chromium).
  // Avoid optional chaining (obj?.prop) and nullish coalescing (a ?? b).
  const coalesce = (value, fallback) =>
    value === null || value === undefined ? fallback : value;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    // removed from HTML: server/version pills

    featuredTitle: $('#featuredTitle'),
    featuredExcerpt: $('#featuredExcerpt'),
    featuredDate: $('#featuredDate'),
    featuredRead: $('#featuredRead'),

    newsList: $('#newsList'),
    patchList: $('#patchList'),
  };

  const DEFAULT_DATA = {
    news: [
      {
        id: 1,
        title: 'Season 4: The Dark Convergence is here!',
        excerpt:
          'Our biggest update yet: new dungeons, raids, and a complete story arc. Gather your party and explore the new content.',
        date: '2026-02-10',
        category: 'Major Update',
        variant: 'danger',
        readTime: '5 min',
        url: '#',
        featured: true,
      },
      {
        id: 2,
        title: 'Event: Double XP Weekend',
        excerpt: 'Level up faster this weekend. Earn double experience in all activities.',
        date: '2026-02-08',
        category: 'Event',
        variant: 'warn',
        readTime: '2 min',
        url: '#',
        featured: false,
      },
      {
        id: 3,
        title: 'New legendary weapons released',
        excerpt: 'Discover the Chaos Blade series and exclusive loot from the new raid.',
        date: '2026-02-06',
        category: 'Content',
        variant: 'info',
        readTime: '3 min',
        url: '#',
        featured: false,
      },
      {
        id: 4,
        title: 'Scheduled maintenance',
        excerpt: 'Scheduled maintenance to improve server stability and performance.',
        date: '2026-02-05',
        category: 'Maintenance',
        variant: 'default',
        readTime: '1 min',
        url: '#',
        featured: false,
      },
    ],
    patchNotes: [
      {
        id: 'v4.1.5',
        title: 'Patch v4.1.5',
        excerpt: 'Balance adjustments and general fixes. Improvements to PvP and performance.',
        date: '2026-02-01',
        variant: 'info',
        url: '#',
      },
      {
        id: 'hotfix-02',
        title: 'Hotfix 02',
        excerpt: 'Crash fix when entering instances and adjustments to loot tables.',
        date: '2026-01-28',
        variant: 'default',
        url: '#',
      },
    ],
  };

  const state = {
    data: JSON.parse(JSON.stringify(DEFAULT_DATA)),
    featuredIdx: 0,
  };

  function setDot(dotEl, kind) {
    if (!dotEl) return;
    dotEl.classList.remove('dot--ok', 'dot--bad', 'dot--pending');
    if (kind === 'ok') dotEl.classList.add('dot--ok');
    else if (kind === 'bad') dotEl.classList.add('dot--bad');
    else dotEl.classList.add('dot--pending');
  }

  function setServerStatus({ ok, text }) {
    // Pills were removed from HTML, keep function as a no-op for Qt compatibility.
    return { ok, text };
  }

  function badgeClass(variant) {
    switch (variant) {
      case 'danger':
        return 'badge badge--danger';
      case 'warn':
      case 'warning':
        return 'badge badge--warn';
      case 'info':
        return 'badge badge--info';
      default:
        return 'badge badge--default';
    }
  }

  function renderList(listEl, items, kind) {
    listEl.innerHTML = '';
    for (const it of items) {
      const wrapper = document.createElement('article');
      wrapper.className = 'item';

      const top = document.createElement('div');
      top.className = 'item-top';

      const h = document.createElement('h3');
      h.className = 'item-title';
      h.textContent = it.title;

      const badge = document.createElement('span');
      badge.className = badgeClass(it.variant);
      badge.textContent = kind === 'patch' ? 'Patch' : coalesce(it.category, 'News');

      top.append(h, badge);

      const p = document.createElement('p');
      p.className = 'item-excerpt';
      p.textContent = coalesce(it.excerpt, '');

      const foot = document.createElement('div');
      foot.className = 'item-foot';

      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.innerHTML = `<span>🗓 ${coalesce(it.date, '—')}</span>${it.readTime ? `<span>⏱ ${it.readTime}</span>` : ''}`;
      foot.append(meta);

      wrapper.append(top, p, foot);
      listEl.append(wrapper);
    }
  }

  function chooseFeaturedIndex() {
    const featured = state.data.news.findIndex((n) => n.featured);
    return featured >= 0 ? featured : 0;
  }

  function renderFeatured(idx) {
    const items = state.data.news || [];
    if (!items.length) return;

    const safe = ((idx % items.length) + items.length) % items.length;
    state.featuredIdx = safe;
    const it = items[safe];

    els.featuredTitle.textContent = coalesce(it.title, '—');
    els.featuredExcerpt.textContent = coalesce(it.excerpt, '');
    els.featuredDate.textContent = coalesce(it.date, '—');
    els.featuredRead.textContent = coalesce(it.readTime, '—');
  }

  function setSubtitle(text) {
    // Subtitle was removed from HTML; keep function for Qt compatibility.
    return text;
  }

  function setVersion(text) {
    // Pills were removed from HTML, keep function as a no-op for Qt compatibility.
    return text;
  }

  function setNews({ featuredIndex, items } = {}) {
    if (Array.isArray(items)) state.data.news = items;
    const idx = typeof featuredIndex === 'number' ? featuredIndex : chooseFeaturedIndex();
    renderFeatured(idx);
    const regular = (state.data.news || []).filter((n, i) => i !== state.featuredIdx);
    renderList(els.newsList, regular, 'news');
  }

  function setPatchNotes(items) {
    if (Array.isArray(items)) state.data.patchNotes = items;
    renderList(els.patchList, state.data.patchNotes || [], 'patch');
  }

  function initTabs() {
    const tabs = $$('.tab');
    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const key = btn.dataset.tab;
        $$('.panel').forEach((p) => p.classList.remove('is-active'));
        const panel = $(`#panel-${key}`);
        if (panel) panel.classList.add('is-active');
      });
    });
  }

  // Public API for Qt
  window.vortex = {
    setSubtitle,
    setVersion,
    setServerStatus,
    setNews,
    setPatchNotes,
  };

  // Boot
  initTabs();

  setSubtitle('HeeHo World');
  // Render defaults
  state.featuredIdx = chooseFeaturedIndex();
  renderFeatured(state.featuredIdx);
  const regular = (state.data.news || []).filter((_, i) => i !== state.featuredIdx);
  renderList(els.newsList, regular, 'news');
  renderList(els.patchList, state.data.patchNotes || [], 'patch');

  // Optional: try to fetch a local JSON next to the page to override defaults
  // Create `data.json` beside index.html if you want.
  fetch('./data.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      if (!json) return;
      if (json.version) setVersion(json.version);
      // ignore subtitle (not used)
      if (json.serverStatus) setServerStatus(json.serverStatus);
      if (Array.isArray(json.news)) setNews({ items: json.news, featuredIndex: json.featuredIndex });
      if (Array.isArray(json.patchNotes)) setPatchNotes(json.patchNotes);
    })
    .catch(() => {
      // ignore (offline / file:// restrictions)
    });

  // Optional: load from backend API (same data used by /news).
  function getApiBaseFromQuery() {
    try {
      const u = new URL(window.location.href);
      const apiBase = u.searchParams.get('api');
      return apiBase ? apiBase.replace(/\/+$/, '') : null;
    } catch {
      return null;
    }
  }

  async function tryLoadFromApi() {
    const apiBase = (window.vortexConfig && window.vortexConfig.apiBase) || getApiBaseFromQuery();
    if (!apiBase) return;

    try {
      const r = await fetch(`${apiBase}/news?limit=10`, { cache: 'no-store' });
      if (!r.ok) return;
      const json = await r.json();
      const items = Array.isArray(json && json.data) ? json.data : [];
      if (!items.length) return;

      const mapped = items.map((n) => ({
        id: n.id,
        title: n.title,
        excerpt: n.excerpt,
        date: (n.publishedAt || n.createdAt || '').slice(0, 10),
        category: n.category,
        variant: n.badgeVariant || 'default',
        featured: !!n.featured,
        readTime: n.readTime || null,
      }));

      setNews({ items: mapped });
    } catch {
      // ignore
    }
  }

  tryLoadFromApi();
})();
