// ================================================================
//  CLAUDE SKIN FOR CHATGPT — popup.js
// ================================================================

const toggle    = document.getElementById('toggle');
const status    = document.getElementById('status');
const statusTxt = document.getElementById('status-text');
const reloadBtn = document.getElementById('reload-btn');

// ── Load persisted state ─────────────────────────────────────────
chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
  toggle.checked = enabled;
  updateUI(enabled);
});

// ── Toggle handler ───────────────────────────────────────────────
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;

  chrome.storage.sync.set({ enabled }, () => {
    updateUI(enabled);
    reloadBtn.classList.add('show');

    // Best-effort: notify any open ChatGPT tabs
    chrome.tabs.query(
      { url: ['https://chatgpt.com/*', 'https://chat.openai.com/*'] },
      (tabs) => {
        tabs.forEach(tab =>
          chrome.tabs.sendMessage(tab.id, {
            type: 'CLAUDE_SKIN_TOGGLE', enabled,
          }).catch(() => {})
        );
      }
    );
  });
});

// ── Reload active ChatGPT tab ────────────────────────────────────
reloadBtn.addEventListener('click', () => {
  chrome.tabs.query(
    {
      active: true,
      url: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
    },
    (tabs) => {
      if (tabs[0]) chrome.tabs.reload(tabs[0].id);
      window.close();
    }
  );
});

// ── UI helpers ───────────────────────────────────────────────────
function updateUI(enabled) {
  status.className      = 'status ' + (enabled ? 'on' : 'off');
  statusTxt.textContent = enabled ? 'Skin active' : 'Skin disabled';
}
