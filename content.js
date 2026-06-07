// ================================================================
//  CLAUDE SKIN FOR CHATGPT — content.js  v2.0.0  (DARK)
//
//  1. Checks chrome.storage for enabled state
//  2. Injects DM Sans font (via JS to avoid ChatGPT CSP issues)
//  3. Overrides ChatGPT's dynamically-applied CSS custom properties
//  4. Forces DARK mode so ChatGPT's native dark styles align with us
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

  // All CSS vars to override on ChatGPT's :root — Claude DARK palette
  const CLAUDE_VARS = {
    '--main-surface-primary':      '#262624',
    '--main-surface-secondary':    '#1F1E1D',
    '--main-surface-tertiary':     '#30302E',
    '--sidebar-surface-primary':   '#1F1E1D',
    '--sidebar-surface-secondary': '#262624',
    '--sidebar-surface-tertiary':  '#30302E',
    '--bg-primary':                '#262624',
    '--bg-secondary':              '#1F1E1D',
    '--bg-elevated-secondary':     '#30302E',
    '--text-primary':              '#F5F4EE',
    '--text-secondary':            '#C9C6BD',
    '--text-tertiary':             '#9B968C',
    '--text-quaternary':           '#75726B',
    '--border-default':            '#3A3936',
    '--border-light':              '#2E2D2B',
    '--border-medium':             '#3A3936',
    '--border-heavy':              '#4A4845',
    '--border-sharp':              '#3A3936',
    '--surface-tertiary':          '#30302E',
    '--link':                      '#D97757',
    '--button-primary-bg':         '#D97757',
    '--button-primary-text':       '#FFFFFF',
    '--icon-default':              '#9B968C',
    '--icon-bright':               '#F5F4EE',
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

  // ── 3. Dark mode enforcement ─────────────────────────────────────
  // Claude's interface (as targeted here) is dark. Force ChatGPT into
  // dark mode so its native dark styles line up with our overrides.
  function forceDarkMode() {
    const html = document.documentElement;
    html.classList.add('dark');
    html.classList.remove('light');
    if (html.getAttribute('data-theme') === 'light')
      html.setAttribute('data-theme', 'dark');
    html.style.colorScheme = 'dark';
    if (document.body) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      document.body.style.colorScheme = 'dark';
    }
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
      forceDarkMode();
      patchTitle();
    });
  });

  // ── 7. Init ──────────────────────────────────────────────────────
  function init() {
    injectFont();
    applyCSSVars();
    forceDarkMode();
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
        forceDarkMode();
        replaceFavicon();
        patchTitle();
        if (document.body)
          observer.observe(document.body, { childList: true, subtree: false });
      });
    }

    window.addEventListener('load', () => {
      applyCSSVars();
      forceDarkMode();
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
