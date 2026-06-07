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
  // Unified flat #1F1F1E base; only the input box / menus lift slightly.
  const CLAUDE_VARS = {
    '--main-surface-primary':      '#1F1F1E',
    '--main-surface-secondary':    '#1F1F1E',
    '--main-surface-tertiary':     '#2A2A28',
    '--sidebar-surface-primary':   '#1F1F1E',
    '--sidebar-surface-secondary': '#1F1F1E',
    '--sidebar-surface-tertiary':  '#2A2A28',
    '--bg-primary':                '#1F1F1E',
    '--bg-secondary':              '#1F1F1E',
    '--bg-elevated-secondary':     '#2A2A28',
    '--text-primary':              '#F5F4EE',
    '--text-secondary':            '#D4D1C8',
    '--text-tertiary':             '#9B968C',
    '--text-quaternary':           '#75726B',
    '--border-default':            '#333330',
    '--border-light':              '#2A2A28',
    '--border-medium':             '#333330',
    '--border-heavy':              '#45453F',
    '--border-sharp':              '#333330',
    '--surface-tertiary':          '#2A2A28',
    '--link':                      '#D97757',
    '--button-primary-bg':         '#D97757',
    '--button-primary-text':       '#FFFFFF',
    '--icon-default':              '#9B968C',
    '--icon-bright':               '#F5F4EE',
  };

  // ChatGPT/OpenAI blossom logo, recoloured coral — injected beside the
  // greeting headline so it mirrors Claude's coral mark by the greeting.
  const CHATGPT_LOGO =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
    'fill="#D97757" aria-hidden="true"><path d="M22.2819 9.8211a5.9847 ' +
    '5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 ' +
    '6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 ' +
    '6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 ' +
    '0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 ' +
    '5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 ' +
    '0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419' +
    '-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 ' +
    '1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 ' +
    '4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 ' +
    '4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 ' +
    '0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 ' +
    '7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l' +
    '5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 ' +
    '4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 ' +
    '7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 ' +
    '8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735' +
    '-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 ' +
    '.0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 ' +
    '12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 ' +
    '1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976' +
    '-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>' +
    '</svg>';

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
    Object.entries(CLAUDE_VARS).forEach(([k, v]) => {
      if (style.getPropertyValue(k) !== v) style.setProperty(k, v);
    });
  }

  // ── 3. Dark mode enforcement ─────────────────────────────────────
  // Claude's interface (as targeted here) is dark. Force ChatGPT into
  // dark mode so its native dark styles line up with our overrides.
  function forceDarkMode() {
    const html = document.documentElement;
    if (!html.classList.contains('dark')) html.classList.add('dark');
    if (html.classList.contains('light')) html.classList.remove('light');
    if (html.getAttribute('data-theme') === 'light')
      html.setAttribute('data-theme', 'dark');
    if (html.style.colorScheme !== 'dark') html.style.colorScheme = 'dark';
    if (document.body) {
      if (!document.body.classList.contains('dark'))
        document.body.classList.add('dark');
      if (document.body.classList.contains('light'))
        document.body.classList.remove('light');
      if (document.body.style.colorScheme !== 'dark')
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

  // ── 4b. Greeting logo injection ──────────────────────────────────
  // Find the greeting headline and prepend the coral ChatGPT mark so it
  // sits beside the message above the prompt bar (like Claude's ✻).
  function addGreetingLogo() {
    const main = document.querySelector('main');
    if (!main) return;

    let h = main.querySelector('h1');
    if (!h) {
      const cands = main.querySelectorAll('h1, h2, h3, div, span, p');
      for (const el of cands) {
        const t = (el.textContent || '').trim();
        if (el.children.length === 0 && t.length < 80 &&
            /^(good (morning|afternoon|evening)|how can i help|where should we begin|what('| a)re you working on|ready when you are)/i
              .test(t)) {
          h = el; break;
        }
      }
    }
    if (!h || h.querySelector('.claude-skin-spark')) return;

    const spark = document.createElement('span');
    spark.className = 'claude-skin-spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.innerHTML = CHATGPT_LOGO;
    h.insertBefore(spark, h.firstChild);
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
      addGreetingLogo();
    });
  });

  // ── 7. Init ──────────────────────────────────────────────────────
  function init() {
    injectFont();
    applyCSSVars();
    forceDarkMode();
    replaceFavicon();
    patchTitle();
    addGreetingLogo();

    // Watch <html> for class/attr changes (theme toggles)
    observer.observe(document.documentElement, {
      attributes:      true,
      childList:       false,
      subtree:         false,
      attributeFilter: ['class', 'data-theme', 'style'],
    });

    // Watch <body> subtree for SPA navigation / late-mounting greeting
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree:   true,
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
        addGreetingLogo();
        if (document.body)
          observer.observe(document.body, { childList: true, subtree: true });
      });
    }

    window.addEventListener('load', () => {
      applyCSSVars();
      forceDarkMode();
      replaceFavicon();
      addGreetingLogo();
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
