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
    '--text-primary':              '#CCC9AF',
    '--text-secondary':            '#CCC9AF',
    '--text-tertiary':             '#CCC9AF',
    '--text-quaternary':           '#ABA890',
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

  // Claude coral starburst logo (the uploaded mark) — 12 filled tapered
  // spokes + centre hub, with mild organic length variation. Built once so
  // every place we stamp it (greeting, brand, favicon, any ChatGPT logo)
  // is identical. STAR_INNER is the geometry (no <svg> wrapper).
  const STAR_PATH = (function () {
    const cx = 290, cy = 290, n = 12;
    const ri = 50, rm = 146, hw = 36;   // base radius, shoulder radius, half-width
    let d = '';
    for (let i = 0; i < n; i++) {
      const a  = (Math.PI * 2 * i) / n - Math.PI / 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      const ro = 268 + 16 * Math.sin(i * 2.7);   // tip radius, slight wobble
      const P  = (x, y) =>
        (cx + x * ca - y * sa).toFixed(1) + ',' +
        (cy + x * sa + y * ca).toFixed(1);
      d += 'M' + P(ri, 0) + 'L' + P(rm, hw) + 'L' + P(ro, 0) +
           'L' + P(rm, -hw) + 'Z';
    }
    return d;
  })();

  const STAR_INNER =
    '<circle cx="290" cy="290" r="54"/><path d="' + STAR_PATH + '"/>';

  const CLAUDE_STAR =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 580" ' +
    'fill="#D97757" aria-hidden="true">' + STAR_INNER + '</svg>';

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
    // The Claude coral starburst on a transparent tile
    const url = URL.createObjectURL(
      new Blob([CLAUDE_STAR], { type: 'image/svg+xml' })
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
    spark.innerHTML = CLAUDE_STAR;
    h.insertBefore(spark, h.firstChild);
  }

  // ── 4c. Replace EVERY ChatGPT logo with the Claude starburst ─────
  // Turn an existing <svg> into the Claude star (keeps it in place/sized).
  function setStar(svg) {
    if (!svg || svg.classList.contains('claude-skin-brand')) return;
    svg.setAttribute('viewBox', '0 0 580 580');
    svg.setAttribute('fill', '#D97757');
    svg.removeAttribute('stroke');
    svg.innerHTML = STAR_INNER;
    svg.classList.add('claude-skin-brand');
  }

  function replaceLogos() {
    // 1. Any explicitly ChatGPT-labelled logo (sidebar brand, header, etc.)
    document.querySelectorAll(
      '[aria-label="ChatGPT"] svg, a[aria-label*="ChatGPT" i] svg, ' +
      '[data-testid*="brand" i] svg, [class*="brand" i] svg'
    ).forEach(setStar);

    // 2. <img> logos (alt text mentions ChatGPT/OpenAI) → swap for the star
    document.querySelectorAll(
      'img[alt*="ChatGPT" i], img[alt*="OpenAI" i], img[src*="openai" i]'
    ).forEach((img) => {
      if (img.dataset.claudeSkin) return;
      img.dataset.claudeSkin = '1';
      const span = document.createElement('span');
      span.className = 'claude-skin-brand-wrap';
      span.style.cssText =
        'display:inline-flex;width:' + (img.width || 24) + 'px;height:' +
        (img.height || 24) + 'px;';
      span.innerHTML = CLAUDE_STAR;
      img.replaceWith(span);
    });

    // 3. Assistant avatar marks (the little ChatGPT logo by replies)
    document.querySelectorAll(
      '[data-message-author-role="assistant"] [class*="avatar"] svg, ' +
      '[data-testid*="avatar" i] svg, [class*="gizmo"] svg'
    ).forEach(setStar);

    // 4. Top-left corner brand by position (when it carries no label)
    const nav = document.querySelector('nav, aside, header');
    if (nav) {
      let best = null, bestScore = Infinity;
      nav.querySelectorAll('svg').forEach((s) => {
        if (s.classList.contains('claude-skin-icon') ||
            s.classList.contains('claude-skin-brand')) return;
        const btn = s.closest('button, a');
        const lbl = ((btn && btn.getAttribute('aria-label')) || '')
          .toLowerCase();
        if (/sidebar|close|open|toggle|collapse/.test(lbl)) return;
        const r = s.getBoundingClientRect();
        if (!r.width || r.top > 96 || r.left > 160) return;
        const score = r.left + r.top;
        if (score < bestScore) { bestScore = score; best = s; }
      });
      if (best) { setStar(best); best.classList.add('claude-skin-brand-corner'); }
    }
  }

  // ── 4c-2. Relabel every visible "ChatGPT" → "Claude" ─────────────
  function relabelText() {
    if (!document.body) return;
    const walker = document.createTreeWalker(
      document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || node.nodeValue.indexOf('ChatGPT') === -1)
            return NodeFilter.FILTER_REJECT;
          const p = node.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA')
            return NodeFilter.FILTER_REJECT;
          // never touch what the user is typing
          if (p.closest && p.closest(
              '#prompt-textarea, [contenteditable="true"], input, textarea'))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      n.nodeValue = n.nodeValue.replace(/ChatGPT/g, 'Claude');
    });
  }

  // ── 4d. Sidebar icons → Claude-style line glyphs ─────────────────
  const NAV_ICONS = {
    'new chat': '<path d="M12 5v14M5 12h14"/>',
    'search':   '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.4-3.4"/>',
    'library':  '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v18H6.5A1.5 1.5 0 0 1 5 19.5z"/><path d="M9 3v18"/>',
    'apps':     '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
    'codex':    '<path d="M16 18l5-6-5-6"/><path d="M8 6l-5 6 5 6"/>',
    'projects': '<path d="M3 8a2 2 0 0 1 2-2h3.2a2 2 0 0 0 1.4-.6l.6-.6A2 2 0 0 1 13 4h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  };

  function navIcon(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" width="20" ' +
      'height="20" class="claude-skin-icon" aria-hidden="true">' +
      inner + '</svg>';
  }

  function swapSidebarIcons() {
    const nav = document.querySelector('nav, aside');
    if (!nav) return;
    nav.querySelectorAll('a, button').forEach((item) => {
      const label = (item.getAttribute('aria-label') || item.textContent || '')
        .trim().toLowerCase();
      if (!label || label.length > 24) return;   // skip recents / long titles

      let key = null;
      if (/new chat/.test(label))           key = 'new chat';
      else if (/search/.test(label))        key = 'search';
      else if (/^library/.test(label))      key = 'library';
      else if (/^apps?\b/.test(label))      key = 'apps';
      else if (/codex/.test(label))         key = 'codex';
      else if (/^projects?\b/.test(label))  key = 'projects';
      if (!key) return;

      const svg = item.querySelector('svg');
      if (!svg || svg.classList.contains('claude-skin-icon')) return;
      svg.outerHTML = navIcon(NAV_ICONS[key]);
    });
  }

  // ── 4e. Composer box tagging ─────────────────────────────────────
  // Tag the real rounded input box so #2C2C2A only paints it (never a
  // full-width wrapper), and strip backgrounds off sibling containers so
  // no stray lighter-gray band appears in the middle of the screen.
  function styleComposer() {
    const ta = document.querySelector(
      '#prompt-textarea, textarea[name="prompt-textarea"], [contenteditable="true"]'
    );
    if (!ta) return;
    const form = ta.closest('form');
    if (!form) return;

    // The visual box = the direct child of <form> containing the textarea.
    let box = ta;
    while (box.parentElement && box.parentElement !== form) {
      box = box.parentElement;
    }
    if (box !== ta && !box.classList.contains('claude-skin-composer')) {
      box.classList.add('claude-skin-composer');
      // Paint on the first frame (before the stylesheet match resolves) so the
      // box never flashes ChatGPT's default surface / a thin coral bar.
      box.style.backgroundColor = '#2C2C2A';
    }

    // Neutralise any other full-width children of the form (stray bands).
    Array.from(form.children).forEach((ch) => {
      if (ch !== box) {
        ch.classList.add('claude-skin-composer-bg');
        ch.style.backgroundColor = 'transparent';
        ch.style.backgroundImage = 'none';
      }
    });
  }

  function applyDynamicArt() {
    addGreetingLogo();
    replaceLogos();
    relabelText();
    swapSidebarIcons();
    styleComposer();
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
      applyDynamicArt();
    });
  });

  // ── 7. Init ──────────────────────────────────────────────────────
  function init() {
    injectFont();
    applyCSSVars();
    forceDarkMode();
    replaceFavicon();
    patchTitle();
    applyDynamicArt();

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
        applyDynamicArt();
        if (document.body)
          observer.observe(document.body, { childList: true, subtree: true });
      });
    }

    window.addEventListener('load', () => {
      applyCSSVars();
      forceDarkMode();
      replaceFavicon();
      applyDynamicArt();
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
