// ================================================================
//  CLAUDE SKIN FOR CHATGPT — content.js  v1.0.0
//
//  1. Checks chrome.storage for enabled state
//  2. Injects DM Sans font (via JS to avoid ChatGPT CSP issues)
//  3. Overrides ChatGPT's dynamically-applied CSS custom properties
//  4. Suppresses dark mode if ChatGPT tries to force it
//  5. Replaces the browser tab favicon with a Claude-style mark
//  6. Patches the page title (ChatGPT -> Claude)
//  7. MutationObserver re-applies on SPA route changes
// ================================================================

(function () {
  'use strict';

  const FONT_URL =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght' +
    '@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600' +
    ';1,9..40,400&display=swap';

  // All CSS vars to override on ChatGPT's :root
  const CLAUDE_VARS = {
    '--main-surface-primary':      '#F4F3EE',
    '--main-surface-secondary':    '#ECEAE3',
    '--main-surface-tertiary':     '#E0DDD5',
    '--sidebar-surface-primary':   '#1A1918',
    '--sidebar-surface-secondary': '#242220',
    '--sidebar-surface-tertiary':  '#2E2C29',
    '--text-primary':              '#1A1A18',
    '--text-secondary':            '#6B6760',
    '--text-tertiary':             '#9B9690',
    '--border-default':            '#E0DDD5',
    '--border-light':              '#ECEAE3',
    '--border-sharp':              '#D4D1C8',
    '--surface-tertiary':          '#ECEAE3',
    '--link':                      '#DA7756',
    '--button-primary-bg':         '#DA7756',
    '--button-primary-text':       '#FFFFFF',
    '--icon-default':              '#6B6760',
    '--icon-bright':               '#1A1A18',
  };

  // ── 1. Font injection ────────────────────────────────────────────
  function injectFont() {
    if (document.getElementById('claude-skin-font')) return;
    const link  = document.createElement('link');
    link.id     = 'claude-skin-font';
    link.rel    = 'stylesheet';
    link.href   = FONT_URL;
    (document.head || document.documentElement).appendChild(link);
  }

  // ── 2. CSS variable override ─────────────────────────────────────
  // ChatGPT sometimes resets its own vars via JS; we re-apply after.
  function applyCSSVars() {
    const style = document.documentElement.style;
    Object.entries(CLAUDE_VARS).forEach(([k, v]) => style.setProperty(k, v));
  }

  // ── 3. Dark mode suppression ─────────────────────────────────────
  function suppressDarkMode() {
    const html = document.documentElement;
    html.classList.remove('dark');
    if (html.getAttribute('data-theme') === 'dark')
      html.setAttribute('data-theme', 'light');
    if (html.style.colorScheme === 'dark')
      html.style.colorScheme = 'light';
    if (document.body && document.body.style.colorScheme === 'dark')
      document.body.style.colorScheme = 'light';
  }

  // ── 4. Favicon replacement ───────────────────────────────────────
  function replaceFavicon() {
    // Minimal SVG approximating Claude's ring mark in coral
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
        '<rect width="64" height="64" rx="14" fill="#F4F3EE"/>',
        '<circle cx="32" cy="32" r="15" fill="#DA7756"/>',
        '<circle cx="32" cy="32" r="8" fill="#F4F3EE" opacity="0.55"/>',
      '</svg>',
    ].join('');
    const url = URL.createObjectURL(
      new Blob([svg], { type: 'image/svg+xml' })
    );
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link     = document.createElement('link');
      link.rel = 'icon';
      (document.head || document.documentElement).appendChild(link);
    }
    link.href = url;
  }

  // ── 5. Page title patch ──────────────────────────────────────────
  function patchTitle() {
    if (document.title && document.title.includes('ChatGPT'))
      document.title = document.title.replace(/ChatGPT/g, 'Claude');
  }

  // ── 6. MutationObserver — re-apply on DOM changes ───────────────
  let rafId = null;
  const observer = new MutationObserver(() => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      applyCSSVars();
      suppressDarkMode();
      patchTitle();
    });
  });

  // ── 7. Init ──────────────────────────────────────────────────────
  function init() {
    injectFont();
    applyCSSVars();
    suppressDarkMode();
    replaceFavicon();
    patchTitle();

    // Watch <html> for class/attr changes (theme toggles)
    observer.observe(document.documentElement, {
      attributes:      true,
      childList:       false,
      subtree:         false,
      attributeFilter: ['class', 'data-theme', 'style'],
    });

    // Watch <body> for new top-level children (SPA navigation)
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree:   false,
      });
    }
  }

  // ── Entry point: check storage, then run ─────────────────────────
  chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
    if (!enabled) return;

    init(); // runs immediately at document_start

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        applyCSSVars();
        suppressDarkMode();
        replaceFavicon();
        patchTitle();
        if (document.body)
          observer.observe(document.body, { childList: true, subtree: false });
      });
    }

    window.addEventListener('load', () => {
      applyCSSVars();
      suppressDarkMode();
      replaceFavicon();
    });
  });

  // ── Toggle handler (from popup) ──────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== 'CLAUDE_SKIN_TOGGLE') return;
    if (msg.enabled) {
      init();
    } else {
      observer.disconnect();
      window.location.reload(); // restore ChatGPT's original styles
    }
  });

})();
