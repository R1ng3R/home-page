/* =========================================================
   Домашняя страница — логика
   ========================================================= */
(() => {
  'use strict';

  /* ------------------------------ Константы ------------------------------ */

  const KEYS = {
    tiles: 'hp.tiles.v1',
    engine: 'hp.engine.v1',
    bg: 'hp.bg.v1'
  };

  const ENGINES = [
    { id: 'google', name: 'Google', placeholder: 'Поиск в Google', url: 'https://www.google.com/search?q=', accent: '#1a73e8' },
    { id: 'yandex', name: 'Яндекс', placeholder: 'Поиск в Яндексе', url: 'https://yandex.ru/search/?text=', accent: '#fc3f1d' },
    { id: 'duckduckgo', name: 'DuckDuckGo', placeholder: 'Поиск в DuckDuckGo', url: 'https://duckduckgo.com/?q=', accent: '#de5833' },
    { id: 'go', name: 'Go', placeholder: 'Поиск в Go', url: 'https://go.mail.ru/search?q=', accent: '#005bd1' }
  ];

  const SUGGEST = {
    google: {
      url: 'https://suggestqueries.google.com/complete/search?client=firefox&hl=ru&q=',
      parse: (data) => (Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [])
    },
    yandex: {
      url: 'https://suggest.yandex.ru/suggest?part=',
      parse: (data) => {
        if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
        return data[1].map((item) => (typeof item === 'string' ? item : item?.text)).filter(Boolean);
      }
    },
    duckduckgo: {
      url: 'https://ac.duckduckgo.com/ac/?type=list&q=',
      parse: (data) => (Array.isArray(data) ? data.map((item) => item?.phrase).filter(Boolean) : [])
    },
    go: null
  };

  const PRESETS = [
    { id: 'night', name: 'Ночь', theme: 'dark', base: '#0b1220', css: 'linear-gradient(150deg, #0b1220 0%, #16233b 55%, #2a3f66 100%)' },
    { id: 'ocean', name: 'Океан', theme: 'dark', base: '#12223f', css: 'linear-gradient(135deg, #0f1e38 0%, #1d3f77 55%, #2f6bb5 100%)' },
    { id: 'dusk', name: 'Сумерки', theme: 'dark', base: '#241630', css: 'linear-gradient(135deg, #1a1030 0%, #3c1f52 50%, #7a3b8f 100%)' },
    { id: 'forest', name: 'Лес', theme: 'dark', base: '#0f1f18', css: 'linear-gradient(135deg, #0c1a14 0%, #143524 55%, #1f5c3d 100%)' },
    { id: 'graphite', name: 'Графит', theme: 'dark', base: '#15171a', css: 'linear-gradient(135deg, #101114 0%, #1c1f24 55%, #2a2f37 100%)' },
    { id: 'wine', name: 'Вино', theme: 'dark', base: '#1c0f14', css: 'linear-gradient(135deg, #17090f 0%, #2e1120 55%, #551d33 100%)' },
    { id: 'slate', name: 'Сланец', theme: 'dark', base: '#161c28', css: 'linear-gradient(135deg, #10141d 0%, #1b2333 55%, #2b3a57 100%)' },
    { id: 'ember', name: 'Угли', theme: 'dark', base: '#1b1208', css: 'linear-gradient(135deg, #150e06 0%, #2a1a0b 55%, #4a2f16 100%)' }
  ];

  const GOOGLE_APPS = [
    { name: 'Документы', url: 'https://docs.google.com/', icon: 'doc', color: '#4285f4' },
    { name: 'Таблицы', url: 'https://sheets.google.com/', icon: 'sheet', color: '#188038' },
    { name: 'Презентации', url: 'https://slides.google.com/', icon: 'slide', color: '#f9ab00' },
    { name: 'Диск', url: 'https://drive.google.com/', icon: 'drive', color: '#4285f4' },
    { name: 'Поиск', url: 'https://www.google.com/', icon: 'search', color: '#4285f4' },
    { name: 'Gmail', url: 'https://mail.google.com/', icon: 'mail', color: '#ea4335' },
    { name: 'Календарь', url: 'https://calendar.google.com/', icon: 'calendar', color: '#4285f4' },
    { name: 'Фото', url: 'https://photos.google.com/', icon: 'photo', color: '#ea4335' },
    { name: 'Карты', url: 'https://maps.google.com/', icon: 'pin', color: '#34a853' },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'play', color: '#ff0000' },
    { name: 'Перевод', url: 'https://translate.google.com/', icon: 'translate', color: '#4285f4' },
    { name: 'Meet', url: 'https://meet.google.com/', icon: 'video', color: '#00832d' }
  ];

  const GOOGLE_LOGO = `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"></path>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"></path>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"></path>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"></path>
  </svg>`;

  /* ------------------------------ Утилиты ------------------------------ */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  const icon = (name, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Не удалось сохранить настройки', error);
      return false;
    }
  }

  function clone(value) {
    try {
      return structuredClone(value);
    } catch {
      return JSON.parse(JSON.stringify(value));
    }
  }

  function normalizeUrl(raw) {
    let value = String(raw || '').trim();
    if (!value) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
      if (/^localhost(:\d+)?([/?#].*)?$/i.test(value)) value = 'http://' + value;
      else value = 'https://' + value;
    }
    try {
      const url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
      return url.href;
    } catch {
      return null;
    }
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./i, '');
    } catch {
      return '';
    }
  }

  function prettyName(url) {
    const host = hostOf(url);
    if (!host) return 'Сайт';
    const first = host.split('.')[0] || host;
    return first.charAt(0).toUpperCase() + first.slice(1).replace(/[-_]+/g, ' ');
  }

  function faviconFor(url) {
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostOf(url))}`;
  }

  function pluralSites(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} сайт`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} сайта`;
    return `${count} сайтов`;
  }

  /* ------------------------------ IndexedDB ------------------------------ */

  const idb = (() => {
    let promise = null;

    function open() {
      if (!promise) {
        promise = new Promise((resolve, reject) => {
          if (!('indexedDB' in window)) {
            reject(new Error('no-idb'));
            return;
          }
          const request = indexedDB.open('dream-home', 1);
          request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains('kv')) request.result.createObjectStore('kv');
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      return promise;
    }

    async function get(key) {
      try {
        const db = await open();
        return await new Promise((resolve, reject) => {
          const request = db.transaction('kv', 'readonly').objectStore('kv').get(key);
          request.onsuccess = () => resolve(request.result ?? null);
          request.onerror = () => reject(request.error);
        });
      } catch {
        return loadJSON('hp.idb.' + key, null);
      }
    }

    async function set(key, value) {
      try {
        const db = await open();
        await new Promise((resolve, reject) => {
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').put(value, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
        saveJSON('hp.idb.' + key, value);
      }
    }

    async function remove(key) {
      try {
        const db = await open();
        await new Promise((resolve, reject) => {
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').delete(key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
        try { localStorage.removeItem('hp.idb.' + key); } catch { /* ignore */ }
      }
    }

    return { get, set, remove };
  })();

  /* ------------------------------ Конфигурация ------------------------------ */

  const CONFIG_DEFAULTS = {
    radius: 5,
    accent: '#1a73e8',
    engineAccent: false,
    colors: {
      text: '#f2f4f8',
      muted: 'rgba(255, 255, 255, 0.7)',
      tileBackground: 'rgba(255, 255, 255, 0.06)',
      tileBorder: 'rgba(255, 255, 255, 0.14)',
      searchBackground: '#141a28',
      searchText: '#ffffff'
    },
    tile: { size: null, showLabels: true },
    search: { width: null, height: null, inset: 60, suggest: true, opacity: 0.55, fontSize: null }
  };

  function mergeConfig(defaults, overrides) {
    const result = Object.assign({}, defaults);
    if (overrides && typeof overrides === 'object') {
      for (const key of Object.keys(overrides)) {
        const value = overrides[key];
        if (
          value && typeof value === 'object' && !Array.isArray(value)
          && defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])
        ) {
          result[key] = Object.assign({}, defaults[key], value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }

  const config = mergeConfig(CONFIG_DEFAULTS, window.APP_CONFIG);

  function applyAccent() {
    const accent = config.engineAccent ? getEngine().accent : config.accent;
    document.documentElement.style.setProperty('--accent', accent);
  }

  function hexToRgbTriple(hex) {
    const match = /^#?([a-f\d]{6})$/i.exec(String(hex || '').trim());
    if (!match) return null;
    const value = parseInt(match[1], 16);
    return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
  }

  function applyConfig() {
    const colors = config.colors;
    const rootDeclarations = [];
    const themeDeclarations = [];

    const root = (name, value) => {
      if (value !== undefined && value !== null && value !== '') rootDeclarations.push(`${name}: ${value};`);
    };
    const theme = (name, value) => {
      if (value !== undefined && value !== null && value !== '') themeDeclarations.push(`${name}: ${value};`);
    };

    root('--radius', `${config.radius}px`);
    if (config.tile && config.tile.size) root('--tile', `${config.tile.size}px`);
    if (config.search) {
      if (config.search.width != null) root('--search-width', `${config.search.width}px`);
      if (config.search.height != null) root('--search-height', `${config.search.height}px`);
      if (config.search.inset != null) root('--search-inset', `${config.search.inset}px`);
      if (config.search.fontSize != null) root('--search-font-size', `${config.search.fontSize}px`);
      if (config.search.opacity != null) {
        const alpha = Math.min(1, Math.max(0, Number(config.search.opacity) || 0));
        theme('--search-alpha', alpha);
      }
    }

    theme('--text', colors.text);
    theme('--muted', colors.muted);
    theme('--tile-bg', colors.tileBackground);
    theme('--tile-border', colors.tileBorder);
    theme('--search-bg', colors.searchBackground);
    theme('--search-text', colors.searchText);

    const rgb = hexToRgbTriple(colors.searchBackground) || '20 26 40';
    theme('--search-rgb', rgb);

    const parts = [];
    if (rootDeclarations.length) parts.push(`:root { ${rootDeclarations.join(' ')} }`);
    if (themeDeclarations.length) parts.push(`html.theme-dark { ${themeDeclarations.join(' ')} }`);

    if (parts.length) {
      const style = document.createElement('style');
      style.id = 'config-style';
      style.textContent = parts.join('\n');
      document.head.append(style);
    }

    if (config.tile && config.tile.showLabels === false) document.body.classList.add('hide-labels');

    applyAccent();
  }

  /* ------------------------------ Состояние ------------------------------ */

  function seedTiles() {
    return [
      { id: uid(), type: 'site', title: 'YouTube', url: 'https://www.youtube.com/' },
      { id: uid(), type: 'site', title: 'Wikipedia', url: 'https://ru.wikipedia.org/' },
      { id: uid(), type: 'site', title: 'GitHub', url: 'https://github.com/' },
      { id: uid(), type: 'site', title: 'Telegram', url: 'https://web.telegram.org/' }
    ];
  }

  function isSite(value) {
    return Boolean(value) && typeof value === 'object' && typeof value.url === 'string' && normalizeUrl(value.url);
  }

  function isFolder(value) {
    return Boolean(value) && typeof value === 'object' && value.type === 'folder' && Array.isArray(value.items);
  }

  function loadTiles() {
    const raw = loadJSON(KEYS.tiles, null);
    if (!Array.isArray(raw)) return seedTiles();

    const seen = new Set();
    const result = [];
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object' || !entry.id || seen.has(entry.id)) continue;

      if (isFolder(entry)) {
        const items = entry.items
          .filter(isSite)
          .map((site) => ({
            id: seen.has(site.id) ? uid() : site.id,
            type: 'site',
            title: String(site.title || prettyName(site.url)).slice(0, 40),
            url: site.url
          }));
        items.forEach((site) => seen.add(site.id));
        if (items.length) {
          seen.add(entry.id);
          result.push({
            id: entry.id,
            type: 'folder',
            title: String(entry.title || 'Папка').slice(0, 40),
            items
          });
        }
      } else if (isSite(entry)) {
        seen.add(entry.id);
        result.push({
          id: entry.id,
          type: 'site',
          title: String(entry.title || prettyName(entry.url)).slice(0, 40),
          url: entry.url
        });
      }
    }
    return result;
  }

  const state = {
    tiles: loadTiles(),
    engine: ENGINES.some((engine) => engine.id === loadJSON(KEYS.engine, '')) ? loadJSON(KEYS.engine, 'google') : 'google',
    bg: loadJSON(KEYS.bg, { type: 'preset', id: 'night' }),
    customBg: null
  };

  if (!state.bg || typeof state.bg !== 'object') state.bg = { type: 'preset', id: 'night' };
  if (state.bg.type === 'preset' && !PRESETS.some((preset) => preset.id === state.bg.id)) {
    state.bg = { type: 'preset', id: 'night' };
  }

  /* ------------------------------ DOM ------------------------------ */

  const dom = {
    bgLayer: $('#bgLayer'),
    appsBtn: $('#appsBtn'),
    appsPopover: $('#appsPopover'),

    searchForm: $('#searchForm'),
    searchInput: $('#searchInput'),
    suggestBox: $('#suggestBox'),
    engine: $('#engine'),
    engineToggle: $('#engineToggle'),
    engineLogo: $('#engineLogo'),
    engineMenu: $('#engineMenu'),

    tilesGrid: $('#tilesGrid'),

    settingsBtn: $('#settingsBtn'),
    settingsDialog: $('#settingsDialog'),
    bgSwatches: $('#bgSwatches'),
    bgUpload: $('#bgUpload'),
    bgColor: $('#bgColor'),
    customBgRow: $('#customBgRow'),
    customBgThumb: $('#customBgThumb'),
    customBgName: $('#customBgName'),
    customBgApply: $('#customBgApply'),
    customBgRemove: $('#customBgRemove'),

    resetAll: $('#resetAll'),

    siteDialog: $('#siteDialog'),
    siteForm: $('#siteForm'),
    siteDialogTitle: $('#siteDialogTitle'),
    sitePreviewIcon: $('#sitePreviewIcon'),
    sitePreviewTitle: $('#sitePreviewTitle'),
    sitePreviewHost: $('#sitePreviewHost'),
    siteName: $('#siteName'),
    siteUrl: $('#siteUrl'),
    siteError: $('#siteError'),
    siteSubmit: $('#siteSubmit'),

    folderDialog: $('#folderDialog'),
    folderName: $('#folderName'),
    folderMeta: $('#folderMeta'),
    folderGrid: $('#folderGrid'),
    unfoldFolder: $('#unfoldFolder'),

    tileMenu: $('#tileMenu'),
    toast: $('#toast'),
    toastText: $('#toastText'),
    toastAction: $('#toastAction')
  };

  let editing = { id: null, folderId: null };
  let currentFolderId = null;
  let suppressClick = false;
  let toastTimer = null;
  let previewTimer = null;
  let previewHost = null;
  let toastHandler = null;

  /* ------------------------------ Иконки и превью ------------------------------ */

  function createIcon(site) {
    const wrap = document.createElement('span');
    wrap.className = 'icon';

    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.src = faviconFor(site.url);

    const showFallback = () => {
      const fallback = document.createElement('span');
      fallback.className = 'icon__fallback';
      fallback.innerHTML = icon('globe');
      wrap.replaceChildren(fallback);
    };

    img.addEventListener('error', showFallback, { once: true });
    img.addEventListener('load', () => {
      if (!img.naturalWidth) showFallback();
    }, { once: true });

    wrap.append(img);
    return wrap;
  }

  function createEmptyPreviewIcon() {
    const wrap = document.createElement('span');
    wrap.className = 'icon';
    wrap.style.color = '#9aa0a6';
    wrap.innerHTML = icon('image');
    return wrap;
  }

  function engineLogoHtml(id) {
    switch (id) {
      case 'google':
        return GOOGLE_LOGO;
      case 'yandex':
        return '<span class="logo-badge logo-badge--yandex">Я</span>';
      case 'duckduckgo':
        return '<span class="logo-badge logo-badge--ddg">D</span>';
      case 'go':
        return '<span class="logo-badge logo-badge--go">Go</span>';
      default:
        return GOOGLE_LOGO;
    }
  }

  /* ------------------------------ Тосты ------------------------------ */

  function hideToast() {
    dom.toast.classList.remove('is-visible');
    toastHandler = null;
  }

  function toast(message, options = {}) {
    dom.toastText.textContent = message;
    const action = options.action || null;

    if (action) {
      dom.toastAction.hidden = false;
      dom.toastAction.textContent = action;
      toastHandler = typeof options.onAction === 'function' ? options.onAction : null;
      dom.toastAction.disabled = !toastHandler;
    } else {
      dom.toastAction.hidden = true;
      toastHandler = null;
    }

    dom.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, options.duration || 4200);
  }

  dom.toastAction.addEventListener('click', () => {
    const handler = toastHandler;
    hideToast();
    if (handler) handler();
  });

  /* ------------------------------ Поиск ------------------------------ */

  function getEngine() {
    return ENGINES.find((engine) => engine.id === state.engine) || ENGINES[0];
  }

  function buildEngineMenu() {
    dom.engineMenu.replaceChildren();
    for (const engine of ENGINES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'engine__item';
      button.dataset.engine = engine.id;
      button.setAttribute('role', 'option');
      button.innerHTML = `
        <span class="engine__logo" aria-hidden="true">${engineLogoHtml(engine.id)}</span>
        <span>${escapeHtml(engine.name)}</span>
        ${icon('check', 'ico engine__check')}
      `;
      button.addEventListener('click', () => {
        setEngine(engine.id);
        closeEngineMenu();
        dom.searchInput.focus();
      });
      dom.engineMenu.append(button);
    }
  }

  function setEngine(id, options = {}) {
    const engine = ENGINES.find((item) => item.id === id) || ENGINES[0];
    state.engine = engine.id;
    try { localStorage.setItem(KEYS.engine, JSON.stringify(engine.id)); } catch { /* ignore */ }

    dom.engineLogo.innerHTML = engineLogoHtml(engine.id);
    dom.searchInput.placeholder = engine.placeholder;
    dom.searchForm.setAttribute('aria-label', engine.placeholder);
    applyAccent();
    hideSuggestions();

    $$('.engine__item', dom.engineMenu).forEach((item) => {
      const selected = item.dataset.engine === engine.id;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    if (options.focusInput) dom.searchInput.focus();
  }

  function openEngineMenu() {
    closeAppsMenu();
    dom.engineMenu.classList.add('is-open');
    dom.engineMenu.inert = false;
    dom.engineToggle.setAttribute('aria-expanded', 'true');
  }

  function closeEngineMenu() {
    dom.engineMenu.classList.remove('is-open');
    dom.engineMenu.inert = true;
    dom.engineToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleEngineMenu() {
    if (dom.engineMenu.classList.contains('is-open')) closeEngineMenu();
    else openEngineMenu();
  }

  dom.engineToggle.addEventListener('click', toggleEngineMenu);

  dom.engineToggle.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openEngineMenu();
      const selected = $('.engine__item[aria-selected="true"]', dom.engineMenu);
      (selected || $('.engine__item', dom.engineMenu))?.focus();
    }
  });

  dom.engineMenu.addEventListener('keydown', (event) => {
    const items = $$('.engine__item', dom.engineMenu);
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = items[(index + step + items.length) % items.length];
      next?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      (event.key === 'Home' ? items[0] : items[items.length - 1])?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeEngineMenu();
      dom.engineToggle.focus();
    } else if (event.key === 'Tab') {
      closeEngineMenu();
    }
  });

  function runSearch(query) {
    const engine = getEngine();
    window.location.href = engine.url + encodeURIComponent(query);
  }

  dom.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = dom.searchInput.value.trim();
    if (!query) {
      dom.searchInput.focus();
      return;
    }
    hideSuggestions();
    runSearch(query);
  });

  /* ------------------------------ Подсказки ------------------------------ */

  let suggestTimer = null;
  let suggestSeq = 0;
  let suggestActive = -1;

  function hideSuggestions() {
    clearTimeout(suggestTimer);
    suggestSeq += 1;
    dom.suggestBox.hidden = true;
    dom.suggestBox.replaceChildren();
    suggestActive = -1;
  }

  function setSuggestActive(index) {
    const items = $$('.suggest__item', dom.suggestBox);
    items.forEach((item, position) => item.classList.toggle('is-active', position === index));
    suggestActive = index;
    items[index]?.scrollIntoView({ block: 'nearest' });
  }

  function renderSuggestions(items) {
    dom.suggestBox.replaceChildren();
    for (const text of items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'suggest__item';
      button.setAttribute('role', 'option');
      button.dataset.q = text;
      button.innerHTML = icon('search') + `<span>${escapeHtml(text)}</span>`;
      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        selectSuggestion(text);
      });
      button.addEventListener('mousemove', () => {
        const index = $$('.suggest__item', dom.suggestBox).indexOf(button);
        if (index !== suggestActive) setSuggestActive(index);
      });
      dom.suggestBox.append(button);
    }
    dom.suggestBox.hidden = false;
    suggestActive = -1;
  }

  function selectSuggestion(query) {
    dom.searchInput.value = query;
    hideSuggestions();
    runSearch(query);
  }

  async function loadSuggestions(query) {
    if (!config.search || config.search.suggest === false) return;
    const provider = SUGGEST[state.engine];
    if (!provider) {
      hideSuggestions();
      return;
    }

    const seq = ++suggestSeq;
    try {
      const response = await fetch(provider.url + encodeURIComponent(query));
      if (!response.ok || seq !== suggestSeq) return;
      const data = await response.json();
      if (seq !== suggestSeq) return;
      const items = (provider.parse(data) || [])
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 8);
      if (seq !== suggestSeq) return;
      if (!items.length) {
        hideSuggestions();
        return;
      }
      renderSuggestions(items);
    } catch {
      if (seq === suggestSeq) hideSuggestions();
    }
  }

  dom.searchInput.addEventListener('input', () => {
    const query = dom.searchInput.value.trim();
    clearTimeout(suggestTimer);
    if (!query) {
      hideSuggestions();
      return;
    }
    suggestTimer = setTimeout(() => loadSuggestions(query), 220);
  });

  dom.searchInput.addEventListener('keydown', (event) => {
    if (dom.suggestBox.hidden) {
      if (event.key === 'ArrowDown' && dom.searchInput.value.trim()) {
        clearTimeout(suggestTimer);
        loadSuggestions(dom.searchInput.value.trim());
      }
      return;
    }

    const items = $$('.suggest__item', dom.suggestBox);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!items.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = suggestActive < 0
        ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
        : (suggestActive + step + items.length) % items.length;
      setSuggestActive(next);
    } else if (event.key === 'Enter') {
      if (suggestActive >= 0 && items[suggestActive]) {
        event.preventDefault();
        selectSuggestion(items[suggestActive].dataset.q);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      hideSuggestions();
    }
  });

  /* ------------------------------ Плитки ------------------------------ */

  function findTile(id) {
    return state.tiles.find((item) => item.id === id) || null;
  }

  function findSlotEl(id) {
    return $$('.slot', dom.tilesGrid).find((slot) => slot.dataset.id === id) || null;
  }

  function saveTiles() {
    saveJSON(KEYS.tiles, state.tiles);
  }

  function siteCopy(site) {
    return {
      id: uid(),
      type: 'site',
      title: site.title,
      url: site.url
    };
  }

  function createTileElement(item) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.id = item.id;
    slot.dataset.type = item.type;

    let tile;
    if (item.type === 'folder') {
      tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile tile--folder';
      tile.setAttribute('aria-label', `Папка «${item.title}», ${pluralSites(item.items.length)}`);

      const preview = document.createElement('span');
      preview.className = 'folder-preview';
      preview.setAttribute('aria-hidden', 'true');
      for (let index = 0; index < 4; index += 1) {
        const cell = document.createElement('span');
        cell.className = 'folder-preview__cell';
        if (item.items[index]) cell.append(createIcon(item.items[index]));
        preview.append(cell);
      }
      tile.append(preview);

      if (item.items.length) {
        const count = document.createElement('span');
        count.className = 'folder-count';
        count.textContent = String(item.items.length);
        tile.append(count);
      }
    } else {
      tile = document.createElement('a');
      tile.className = 'tile';
      tile.href = item.url;
      tile.title = item.title;
      tile.draggable = false;
      tile.append(createIcon(item));
    }

    const label = document.createElement('span');
    label.className = 'slot__label';
    label.textContent = item.title;

    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'slot__menu';
    menuButton.dataset.menu = item.id;
    menuButton.setAttribute('aria-label', `Действия: ${item.title}`);
    menuButton.innerHTML = icon('more');

    slot.append(tile, label, menuButton);
    return slot;
  }

  function createAddSlot() {
    const slot = document.createElement('div');
    slot.className = 'slot slot--add';

    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile tile--add';
    tile.setAttribute('aria-label', 'Добавить сайт');
    tile.innerHTML = icon('plus');

    const label = document.createElement('span');
    label.className = 'slot__label';
    label.textContent = 'Добавить';

    slot.append(tile, label);
    return slot;
  }

  function renderTiles() {
    dom.tilesGrid.replaceChildren();
    for (const item of state.tiles) dom.tilesGrid.append(createTileElement(item));
    dom.tilesGrid.append(createAddSlot());
  }

  function nextFolderName() {
    const names = new Set(state.tiles.filter((item) => item.type === 'folder').map((item) => item.title));
    let index = 1;
    let name = 'Папка';
    while (names.has(name)) {
      index += 1;
      name = `Папка ${index}`;
    }
    return name;
  }

  function mutateTiles(mutator, message, action) {
    const snapshot = clone(state.tiles);
    mutator();
    saveTiles();
    renderTiles();

    if (currentFolderId) {
      if (findTile(currentFolderId)) {
        if (dom.folderDialog.open) renderFolder();
      } else if (dom.folderDialog.open) {
        dom.folderDialog.close();
      }
    }

    if (message) {
      toast(message, action || {
        action: 'Отменить',
        onAction: () => {
          state.tiles = snapshot;
          saveTiles();
          renderTiles();
          if (dom.folderDialog.open) {
            if (currentFolderId && findTile(currentFolderId)) renderFolder();
            else dom.folderDialog.close();
          }
        }
      });
    }
  }

  /* ------------------------------ Диалог сайта ------------------------------ */

  function openSiteDialog(options = {}) {
    const site = options.site || null;
    const folderId = options.folderId || null;
    editing = { id: site ? site.id : null, folderId };

    dom.siteDialogTitle.textContent = site ? 'Изменить сайт' : 'Новый сайт';
    dom.siteSubmit.textContent = site ? 'Сохранить' : 'Добавить';
    dom.siteName.value = site ? site.title : '';
    dom.siteUrl.value = site ? site.url : '';
    dom.siteName.placeholder = 'Например, YouTube';
    dom.siteError.hidden = true;
    dom.siteError.textContent = '';
    dom.siteName.dataset.touched = '';
    previewHost = null;
    updateSitePreview();

    if (!dom.siteDialog.open) dom.siteDialog.showModal();

    const target = site ? dom.siteName : dom.siteUrl;
    setTimeout(() => {
      target.focus();
      if (site) target.select();
    }, 60);
  }

  function updateSitePreview() {
    const url = normalizeUrl(dom.siteUrl.value);
    const typedName = dom.siteName.value.trim();
    const title = typedName || (url ? prettyName(url) : 'Название сайта');

    dom.sitePreviewTitle.textContent = title;
    dom.sitePreviewHost.textContent = url ? hostOf(url) : 'example.com';

    if (!dom.siteName.dataset.touched) {
      dom.siteName.placeholder = url ? prettyName(url) : 'Например, YouTube';
    }

    const host = url ? hostOf(url) : '';
    if (host === previewHost) return;
    previewHost = host;

    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      if (url) dom.sitePreviewIcon.replaceChildren(createIcon({ title, url }));
      else dom.sitePreviewIcon.replaceChildren(createEmptyPreviewIcon());
    }, host ? 350 : 0);
  }

  dom.siteUrl.addEventListener('input', () => {
    dom.siteError.hidden = true;
    updateSitePreview();
  });

  dom.siteName.addEventListener('input', () => {
    dom.siteName.dataset.touched = '1';
    updateSitePreview();
  });

  function showSiteError(message) {
    dom.siteError.textContent = message;
    dom.siteError.hidden = false;
  }

  dom.siteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const url = normalizeUrl(dom.siteUrl.value);
    if (!url) {
      showSiteError('Введите корректный адрес, например youtube.com');
      dom.siteUrl.focus();
      return;
    }

    const title = (dom.siteName.value.trim() || prettyName(url)).slice(0, 32);
    const folder = editing.folderId ? findTile(editing.folderId) : null;

    if (editing.id) {
      let site = null;
      if (folder && folder.type === 'folder') {
        site = folder.items.find((item) => item.id === editing.id) || null;
      } else {
        const item = findTile(editing.id);
        site = item && item.type === 'site' ? item : null;
      }
      if (!site) {
        dom.siteDialog.close();
        return;
      }
      const before = site.title;
      site.title = title;
      site.url = url;
      saveTiles();
      renderTiles();
      if (dom.folderDialog.open) renderFolder();
      dom.siteDialog.close();
      toast(before === title ? 'Сайт обновлён' : `«${before}» переименован`);
      return;
    }

    const site = { id: uid(), type: 'site', title, url };
    if (folder && folder.type === 'folder') {
      folder.items.push(site);
      saveTiles();
      renderTiles();
      if (dom.folderDialog.open) renderFolder();
      dom.siteDialog.close();
      toast(`«${title}» добавлен в папку`);
      return;
    }

    state.tiles.push(site);
    saveTiles();
    renderTiles();
    dom.siteDialog.close();
    toast(`«${title}» добавлен`);
  });

  dom.siteDialog.addEventListener('close', () => {
    editing = { id: null, folderId: null };
    clearTimeout(previewTimer);
  });

  /* ------------------------------ Папка ------------------------------ */

  function openFolder(id, options = {}) {
    const folder = findTile(id);
    if (!folder || folder.type !== 'folder') return;
    closeTileMenu();
    currentFolderId = id;
    dom.folderName.value = folder.title;
    renderFolder();
    if (!dom.folderDialog.open) dom.folderDialog.showModal();
    if (options.focusName) {
      setTimeout(() => {
        dom.folderName.focus();
        dom.folderName.select();
      }, 70);
    }
  }

  function renderFolder() {
    const folder = currentFolderId ? findTile(currentFolderId) : null;
    if (!folder || folder.type !== 'folder') {
      dom.folderDialog.close();
      return;
    }

    dom.folderName.value = folder.title;
    dom.folderMeta.textContent = pluralSites(folder.items.length);
    dom.folderGrid.replaceChildren();

    for (const site of folder.items) {
      const row = document.createElement('div');
      row.className = 'folder-item';

      const link = document.createElement('a');
      link.className = 'folder-item__link';
      link.href = site.url;
      link.title = site.title;

      const iconWrap = document.createElement('span');
      iconWrap.className = 'folder-item__icon';
      iconWrap.append(createIcon(site));

      const name = document.createElement('span');
      name.className = 'folder-item__name';
      name.textContent = site.title;

      link.append(iconWrap, name);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'folder-item__remove';
      remove.setAttribute('aria-label', `Убрать «${site.title}» из папки`);
      remove.innerHTML = icon('x');
      remove.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeSiteFromFolder(folder.id, site.id);
      });

      row.append(link, remove);
      dom.folderGrid.append(row);
    }

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'folder-add';
    add.innerHTML = `<span class="folder-add__plus">${icon('plus')}</span><span>Добавить сайт</span>`;
    add.addEventListener('click', () => openSiteDialog({ folderId: folder.id }));
    dom.folderGrid.append(add);
  }

  function removeSiteFromFolder(folderId, siteId) {
    const folder = findTile(folderId);
    if (!folder || folder.type !== 'folder') return;
    const site = folder.items.find((item) => item.id === siteId);
    if (!site) return;

    const index = state.tiles.indexOf(folder);
    mutateTiles(() => {
      folder.items = folder.items.filter((item) => item.id !== siteId);
      state.tiles.splice(index + 1, 0, site);
      if (!folder.items.length) state.tiles = state.tiles.filter((item) => item.id !== folderId);
    }, `«${site.title}» возвращён на главную`);
  }

  function unfoldFolder(folderId) {
    const folder = findTile(folderId);
    if (!folder || folder.type !== 'folder') return;
    const index = state.tiles.indexOf(folder);
    const sites = folder.items;
    mutateTiles(() => {
      state.tiles.splice(index, 1, ...sites);
    }, `Папка «${folder.title}» распущена`);
    dom.folderDialog.close();
  }

  dom.folderName.addEventListener('input', () => {
    const folder = currentFolderId ? findTile(currentFolderId) : null;
    if (!folder || folder.type !== 'folder') return;
    folder.title = dom.folderName.value.trim().slice(0, 40) || 'Папка';
    saveTiles();
    renderTiles();
  });

  dom.folderName.addEventListener('blur', () => {
    if (!dom.folderName.value.trim()) {
      dom.folderName.value = 'Папка';
      const folder = currentFolderId ? findTile(currentFolderId) : null;
      if (folder) {
        folder.title = 'Папка';
        saveTiles();
        renderTiles();
      }
    }
  });

  dom.unfoldFolder.addEventListener('click', () => {
    if (currentFolderId) unfoldFolder(currentFolderId);
  });

  dom.folderDialog.addEventListener('close', () => {
    currentFolderId = null;
  });

  /* ------------------------------ Объединение и порядок ------------------------------ */

  function combineTiles(sourceId, targetId) {
    const source = findTile(sourceId);
    const target = findTile(targetId);
    if (!source || !target || source.id === target.id) return;

    let folder;

    if (target.type === 'folder') {
      const added = source.type === 'folder' ? source.items : [siteCopy(source)];
      target.items.push(...added);
      state.tiles = state.tiles.filter((item) => item.id !== source.id);
      folder = target;
    } else if (source.type === 'folder') {
      source.items.push(siteCopy(target));
      state.tiles = state.tiles.filter((item) => item.id !== target.id);
      folder = source;
    } else {
      folder = {
        id: uid(),
        type: 'folder',
        title: nextFolderName(),
        items: [siteCopy(target), siteCopy(source)]
      };
      const index = state.tiles.findIndex((item) => item.id === target.id);
      state.tiles = state.tiles.filter((item) => item.id !== source.id && item.id !== target.id);
      state.tiles.splice(Math.max(0, Math.min(index, state.tiles.length)), 0, folder);
    }

    saveTiles();
    renderTiles();
    toast(`Папка «${folder.title}» готова`, {
      action: 'Открыть',
      onAction: () => openFolder(folder.id)
    });
  }

  function reorderTile(id, beforeId) {
    const from = state.tiles.findIndex((item) => item.id === id);
    if (from < 0) return;

    const item = state.tiles[from];
    const rest = state.tiles.filter((entry) => entry.id !== id);
    let index = beforeId ? rest.findIndex((entry) => entry.id === beforeId) : rest.length;
    if (index < 0) index = rest.length;
    rest.splice(index, 0, item);

    if (rest.every((entry, position) => entry.id === state.tiles[position]?.id)) return;

    state.tiles = rest;
    saveTiles();
    renderTiles();
  }

  /* ------------------------------ Перетаскивание ------------------------------ */

  const drag = { current: null };

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const slot = event.target.closest('.slot');
    if (!slot || !slot.dataset.id) return;
    if (event.target.closest('.slot__menu')) return;
    if (!findTile(slot.dataset.id)) return;

    drag.current = {
      id: slot.dataset.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      ghost: null,
      sourceEl: slot,
      targetId: null,
      beforeId: undefined,
      overGrid: false
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
  }

  function onPointerMove(event) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;

    if (!current.started) {
      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
      if (distance < 8) return;
      startDragging(current);
    }

    event.preventDefault();
    positionGhost(current, event.clientX, event.clientY);
    updateDropTarget(current, event.clientX, event.clientY);
  }

  function startDragging(current) {
    current.started = true;
    document.body.classList.add('is-dragging');
    current.sourceEl.classList.add('is-dragging-source');

    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    const sourceTile = current.sourceEl.querySelector('.tile');
    if (sourceTile) ghost.append(sourceTile.cloneNode(true));
    document.body.append(ghost);
    current.ghost = ghost;
    positionGhost(current, current.startX, current.startY);
  }

  function positionGhost(current, x, y) {
    if (!current.ghost) return;
    current.ghost.style.left = `${x}px`;
    current.ghost.style.top = `${y}px`;
  }

  function clearDropVisuals() {
    $$('.slot.is-folder-target', dom.tilesGrid).forEach((slot) => {
      slot.classList.remove('is-folder-target');
      delete slot.dataset.dropLabel;
    });
    removePlaceholder();
  }

  function removePlaceholder() {
    $('.slot--placeholder', dom.tilesGrid)?.remove();
  }

  function updateDropTarget(current, x, y) {
    clearDropVisuals();

    const element = document.elementFromPoint(x, y);
    const slot = element ? element.closest('.slot') : null;
    const gridRect = dom.tilesGrid.getBoundingClientRect();
    const overGrid = x >= gridRect.left && x <= gridRect.right && y >= gridRect.top && y <= gridRect.bottom;
    current.overGrid = overGrid;

    if (slot && slot.dataset.id && slot.dataset.id !== current.id) {
      const target = findTile(slot.dataset.id);
      if (target) {
        slot.classList.add('is-folder-target');
        slot.dataset.dropLabel = target.type === 'folder'
          ? 'В папку'
          : (findTile(current.id)?.type === 'folder' ? 'Объединить' : 'Создать папку');
        current.targetId = target.id;
        current.beforeId = undefined;
        return;
      }
    }

    current.targetId = null;

    if (overGrid) {
      computeInsertIndex(current, x, y);
    } else {
      current.beforeId = undefined;
    }
  }

  function computeInsertIndex(current, x, y) {
    const slots = $$('.slot', dom.tilesGrid).filter((slot) => (
      slot.dataset.id && slot.dataset.id !== current.id
    ));

    let nearest = null;
    let best = Infinity;

    for (const slot of slots) {
      const rect = slot.getBoundingClientRect();
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = dx * 1.4 + dy * 2.2;
      if (distance < best) {
        best = distance;
        nearest = slot;
      }
    }

    if (!nearest) {
      current.beforeId = null;
      showPlaceholder(null);
      return;
    }

    const rect = nearest.getBoundingClientRect();
    if (x < rect.left + rect.width / 2) {
      current.beforeId = nearest.dataset.id;
    } else {
      const next = nearest.nextElementSibling;
      if (next && next.dataset.id && next.dataset.id !== current.id) current.beforeId = next.dataset.id;
      else current.beforeId = null;
    }

    showPlaceholder(current.beforeId);
  }

  function showPlaceholder(beforeId) {
    if ($('.slot--placeholder', dom.tilesGrid)) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'slot slot--placeholder';
    placeholder.innerHTML = '<div class="tile"></div><span class="slot__label" aria-hidden="true">.</span>';

    let anchor = null;
    if (beforeId) {
      anchor = $$('.slot', dom.tilesGrid).find((slot) => slot.dataset.id === beforeId) || null;
    }
    if (!anchor) anchor = $('.slot--add', dom.tilesGrid);

    dom.tilesGrid.insertBefore(placeholder, anchor || null);
  }

  function cleanupDrag(current) {
    document.body.classList.remove('is-dragging');
    current.sourceEl?.classList.remove('is-dragging-source');
    current.ghost?.remove();
    clearDropVisuals();
    drag.current = null;
  }

  function onPointerEnd(event) {
    const current = drag.current;
    if (!current) return;
    if (event.pointerId !== undefined && event.pointerId !== current.pointerId) return;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerEnd);
    window.removeEventListener('pointercancel', onPointerEnd);

    const { started, id, targetId, beforeId, overGrid } = current;
    cleanupDrag(current);

    if (!started) return;

    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 380);

    if (targetId) {
      combineTiles(id, targetId);
    } else if (overGrid && beforeId !== undefined) {
      reorderTile(id, beforeId);
    }
  }

  dom.tilesGrid.addEventListener('pointerdown', onPointerDown);

  document.addEventListener('click', (event) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  /* ------------------------------ Действия с плитками ------------------------------ */

  function closeTileMenu() {
    dom.tileMenu.classList.remove('is-open');
    dom.tileMenu.inert = true;
  }

  function openTileMenu(item, anchor) {
    if (!item) return;

    dom.tileMenu.replaceChildren();

    const addItem = (label, iconName, handler, options = {}) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu__item' + (options.danger ? ' menu__item--danger' : '');
      button.setAttribute('role', 'menuitem');
      button.innerHTML = icon(iconName) + `<span>${escapeHtml(label)}</span>`;
      button.addEventListener('click', () => {
        closeTileMenu();
        handler();
      });
      dom.tileMenu.append(button);
    };

    if (item.type === 'site') {
      addItem('Открыть', 'external', () => { window.location.href = item.url; });
      addItem('Открыть в новой вкладке', 'arrow-out', () => { window.open(item.url, '_blank', 'noopener'); });
      addItem('Изменить', 'edit', () => openSiteDialog({ site: item }));
      const separator = document.createElement('div');
      separator.className = 'menu__sep';
      dom.tileMenu.append(separator);
      addItem('Удалить', 'trash', () => {
        mutateTiles(() => {
          state.tiles = state.tiles.filter((entry) => entry.id !== item.id);
        }, `«${item.title}» удалён`);
      }, { danger: true });
    } else {
      addItem('Открыть', 'folder', () => openFolder(item.id));
      addItem('Переименовать', 'edit', () => openFolder(item.id, { focusName: true }));
      const separator = document.createElement('div');
      separator.className = 'menu__sep';
      dom.tileMenu.append(separator);
      addItem('Распустить папку', 'trash', () => unfoldFolder(item.id), { danger: true });
    }

    dom.tileMenu.style.left = '0px';
    dom.tileMenu.style.top = '0px';
    dom.tileMenu.classList.add('is-open');
    dom.tileMenu.inert = false;

    const rect = anchor.getBoundingClientRect();
    const width = dom.tileMenu.offsetWidth;
    const height = dom.tileMenu.offsetHeight;
    let left = Math.min(rect.right - width, window.innerWidth - 12 - width);
    left = Math.max(12, left);
    let top = rect.bottom + 6;
    if (top + height > window.innerHeight - 12) top = Math.max(12, rect.top - 6 - height);

    dom.tileMenu.style.left = `${left}px`;
    dom.tileMenu.style.top = `${top}px`;
  }

  dom.tilesGrid.addEventListener('click', (event) => {
    const addSlot = event.target.closest('.slot--add');
    if (addSlot) {
      openSiteDialog({});
      return;
    }

    const menuButton = event.target.closest('.slot__menu');
    if (menuButton) {
      event.preventDefault();
      event.stopPropagation();
      const item = findTile(menuButton.dataset.menu);
      if (item) openTileMenu(item, menuButton);
      return;
    }

    const folderButton = event.target.closest('.tile--folder');
    if (folderButton) {
      const slot = folderButton.closest('.slot');
      if (slot?.dataset.id) openFolder(slot.dataset.id);
      return;
    }

    const label = event.target.closest('.slot__label');
    if (label) {
      const slot = label.closest('.slot');
      const item = slot?.dataset.id ? findTile(slot.dataset.id) : null;
      if (item?.type === 'folder') openFolder(item.id);
      else if (item?.type === 'site') window.location.href = item.url;
    }
  });

  dom.tilesGrid.addEventListener('contextmenu', (event) => {
    const slot = event.target.closest('.slot');
    if (!slot || !slot.dataset.id) return;
    event.preventDefault();
    const item = findTile(slot.dataset.id);
    if (item) openTileMenu(item, slot.querySelector('.tile'));
  });

  /* ------------------------------ Приложения ------------------------------ */

  function buildApps() {
    dom.appsPopover.replaceChildren();
    for (const app of GOOGLE_APPS) {
      const link = document.createElement('a');
      link.className = 'app-link';
      link.href = app.url;
      link.setAttribute('role', 'menuitem');
      link.innerHTML = `<svg class="ico" style="color:${app.color}" aria-hidden="true"><use href="#i-${app.icon}"></use></svg><span>${escapeHtml(app.name)}</span>`;
      dom.appsPopover.append(link);
    }
  }

  function openAppsMenu() {
    closeEngineMenu();
    dom.appsPopover.classList.add('is-open');
    dom.appsPopover.inert = false;
    dom.appsBtn.setAttribute('aria-expanded', 'true');
  }

  function closeAppsMenu() {
    dom.appsPopover.classList.remove('is-open');
    dom.appsPopover.inert = true;
    dom.appsBtn.setAttribute('aria-expanded', 'false');
  }

  dom.appsBtn.addEventListener('click', () => {
    if (dom.appsPopover.classList.contains('is-open')) closeAppsMenu();
    else openAppsMenu();
  });

  document.addEventListener('pointerdown', (event) => {
    if (dom.engineMenu.classList.contains('is-open') && !event.target.closest('#engine')) closeEngineMenu();
    if (dom.appsPopover.classList.contains('is-open') && !event.target.closest('.apps')) closeAppsMenu();
    if (dom.tileMenu.classList.contains('is-open') && !event.target.closest('#tileMenu') && !event.target.closest('.slot__menu')) closeTileMenu();
    if (!dom.suggestBox.hidden && !event.target.closest('.search')) hideSuggestions();
  });

  window.addEventListener('scroll', () => {
    closeTileMenu();
    closeAppsMenu();
    closeEngineMenu();
  }, { passive: true });

  window.addEventListener('resize', () => {
    closeTileMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeTileMenu();
      closeAppsMenu();
      closeEngineMenu();
    }

    const active = document.activeElement;
    const typing = active && (
      active.tagName === 'INPUT'
      || active.tagName === 'TEXTAREA'
      || active.tagName === 'SELECT'
      || active.isContentEditable
    );

    if (event.key === '/' && !typing && !$('dialog[open]')) {
      event.preventDefault();
      dom.searchInput.focus();
    }
  });

  /* ------------------------------ Фон ------------------------------ */

  function applyBackground() {
    const layer = dom.bgLayer;
    layer.style.backgroundImage = 'none';
    layer.style.backgroundColor = '#0b1220';

    if (state.bg.type === 'preset') {
      const preset = PRESETS.find((item) => item.id === state.bg.id) || PRESETS[0];
      layer.style.backgroundColor = preset.base;
      layer.style.backgroundImage = preset.css;
    } else if (state.bg.type === 'color') {
      layer.style.backgroundColor = state.bg.value;
    } else if (state.bg.type === 'custom' && state.customBg?.dataUrl) {
      layer.style.backgroundColor = state.customBg.base || '#1a2233';
      layer.style.backgroundImage = `url("${state.customBg.dataUrl}")`;
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', state.bg.type === 'color' ? state.bg.value : '#0b1220');
  }

  function saveBackground() {
    saveJSON(KEYS.bg, state.bg);
  }

  function renderSwatches() {
    dom.bgSwatches.replaceChildren();
    for (const preset of PRESETS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.dataset.id = preset.id;
      button.setAttribute('aria-pressed', String(state.bg.type === 'preset' && state.bg.id === preset.id));
      button.title = preset.name;
      button.innerHTML = `
        <span class="swatch__chip" style="background:${preset.css}">
          <span class="swatch__check">${icon('check')}</span>
        </span>
        <span class="swatch__name">${escapeHtml(preset.name)}</span>
      `;
      button.addEventListener('click', () => {
        state.bg = { type: 'preset', id: preset.id };
        saveBackground();
        applyBackground();
        renderBgUI();
      });
      dom.bgSwatches.append(button);
    }
  }

  function renderBgUI() {
    $$('.swatch', dom.bgSwatches).forEach((button) => {
      button.setAttribute('aria-pressed', String(state.bg.type === 'preset' && button.dataset.id === state.bg.id));
    });

    if (state.bg.type === 'color') dom.bgColor.value = state.bg.value;

    if (state.customBg?.dataUrl) {
      dom.customBgRow.hidden = false;
      dom.customBgThumb.src = state.customBg.dataUrl;
      dom.customBgName.textContent = state.customBg.name || 'Своё изображение';
      dom.customBgApply.hidden = state.bg.type === 'custom';
    } else {
      dom.customBgRow.hidden = true;
    }
  }

  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось прочитать изображение'));
      };
      image.src = url;
    });
  }

  function canvasLuminance(canvas) {
    const sample = document.createElement('canvas');
    sample.width = 32;
    sample.height = 32;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(canvas, 0, 0, 32, 32);
    const data = context.getImageData(0, 0, 32, 32).data;
    let total = 0;
    const pixels = data.length / 4;
    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3] / 255;
      const red = data[index] / 255;
      const green = data[index + 1] / 255;
      const blue = data[index + 2] / 255;
      total += (0.2126 * red + 0.7152 * green + 0.0722 * blue) * alpha;
    }
    return total / pixels;
  }

  async function processImage(file, maxSide, quality) {
    const image = await loadImageFile(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error('Пустое изображение');

    const scale = Math.min(1, maxSide / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', quality),
      theme: canvasLuminance(canvas) < 0.46 ? 'dark' : 'light'
    };
  }

  dom.bgUpload.addEventListener('change', async () => {
    const file = dom.bgUpload.files?.[0];
    dom.bgUpload.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Выберите файл изображения');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast('Файл слишком большой — максимум 30 МБ');
      return;
    }

    toast('Готовлю фон…');
    try {
      const result = await processImage(file, 2560, 0.86);
      state.customBg = {
        dataUrl: result.dataUrl,
        name: file.name.slice(0, 64) || 'Своё изображение',
        theme: result.theme,
        base: '#1a2233'
      };
      await idb.set('customBg', state.customBg);
      state.bg = { type: 'custom' };
      saveBackground();
      applyBackground();
      renderBgUI();
      toast('Фон страницы обновлён');
    } catch (error) {
      console.error(error);
      toast('Не удалось загрузить изображение');
    }
  });

  dom.customBgApply.addEventListener('click', () => {
    if (!state.customBg) return;
    state.bg = { type: 'custom' };
    saveBackground();
    applyBackground();
    renderBgUI();
  });

  dom.customBgRemove.addEventListener('click', async () => {
    state.customBg = null;
    await idb.remove('customBg');
    if (state.bg.type === 'custom') state.bg = { type: 'preset', id: 'night' };
    saveBackground();
    applyBackground();
    renderBgUI();
    toast('Своё изображение удалено');
  });

  dom.bgColor.addEventListener('input', () => {
    state.bg = { type: 'color', value: dom.bgColor.value };
    applyBackground();
  });

  dom.bgColor.addEventListener('change', () => {
    state.bg = { type: 'color', value: dom.bgColor.value };
    saveBackground();
    renderBgUI();
  });

  /* ------------------------------ Настройки ------------------------------ */

  function openSettings() {
    closeTileMenu();
    closeAppsMenu();
    closeEngineMenu();
    renderBgUI();
    if (!dom.settingsDialog.open) dom.settingsDialog.showModal();
  }

  dom.settingsBtn.addEventListener('click', openSettings);

  dom.resetAll.addEventListener('click', async () => {
    const confirmed = window.confirm('Сбросить страницу? Плитки и фон вернутся к исходным.');
    if (!confirmed) return;

    try {
      localStorage.removeItem(KEYS.tiles);
      localStorage.removeItem(KEYS.engine);
      localStorage.removeItem(KEYS.bg);
      localStorage.removeItem('hp.profile.v1');
      localStorage.removeItem('hp.account.v1');
    } catch { /* ignore */ }

    await idb.remove('customBg');

    state.tiles = seedTiles();
    state.bg = { type: 'preset', id: 'night' };
    state.customBg = null;

    saveTiles();
    saveBackground();
    setEngine('google');
    applyBackground();
    renderBgUI();
    renderTiles();
    dom.settingsDialog.close();
    toast('Страница сброшена');
  });

  dom.settingsDialog.addEventListener('click', (event) => {
    if (event.target === dom.settingsDialog) dom.settingsDialog.close();
  });

  /* ------------------------------ Закрытие диалогов ------------------------------ */

  document.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close]');
    if (!closeButton) return;
    const dialog = closeButton.closest('dialog');
    if (dialog) dialog.close();
  });

  for (const dialog of [dom.siteDialog, dom.folderDialog]) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  /* ------------------------------ Запуск ------------------------------ */

  async function init() {
    applyConfig();
    buildApps();
    buildEngineMenu();
    renderSwatches();
    renderTiles();
    setEngine(state.engine);
    dom.engineMenu.inert = true;
    dom.appsPopover.inert = true;
    dom.tileMenu.inert = true;

    if (state.bg.type !== 'custom') applyBackground();

    state.customBg = await idb.get('customBg');
    if (state.bg.type === 'custom' && !state.customBg?.dataUrl) {
      state.bg = { type: 'preset', id: 'night' };
      saveBackground();
    }
    applyBackground();
    renderBgUI();
  }

  init();
})();
