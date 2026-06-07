# Claude Skin — ChatGPT

A Chrome extension that applies Claude's warm, minimalist design
identity to ChatGPT. Built from scratch with Claude Code.

## What it changes

Recreates Claude's warm **dark** theme on top of ChatGPT.

| Element    | ChatGPT original          | Claude skin (dark)         |
|------------|--------------------------|----------------------------|
| Canvas     | white / grey             | #262624 warm dark charcoal |
| Sidebar    | #202123 cool grey        | #1F1E1D warm near-black    |
| Text       | dark on light            | #F5F4EE light cream        |
| Greeting   | system sans              | warm serif, cream          |
| Accent     | #10A37F OpenAI green     | #D97757 coral/terracotta   |
| Messages   | Pill bubbles             | Flat assistant, dark user bubble |
| Typography | Default system font      | DM Sans (UI), serif headline |
| Input box  | White, green ring        | #30302E dark, rounded      |
| Send btn   | Green                    | Coral                      |
| Inline code| Grey on white            | Rust on dark wash          |
| Code blocks| Dark grey                | Warm near-black #1A1917    |
| Favicon    | OpenAI logo              | Claude coral ring mark     |
| Tab title  | "ChatGPT"                | "Claude"                   |

## File structure

```
claude-skin-for-chatgpt/
├── manifest.json    Chrome extension manifest (Manifest V3)
├── content.css      All visual overrides (~280 lines)
├── content.js       CSS var overrides, font injection, observer
├── popup.html       Extension popup (toggle switch UI)
├── popup.js         Toggle logic via chrome.storage.sync
└── README.md        This file
```

## Installation

1. Unzip this folder somewhere permanent on your machine
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (toggle, top-right corner)
4. Click **Load unpacked** → select the `claude-skin-for-chatgpt/` folder
5. Open [chatgpt.com](https://chatgpt.com) — the skin applies immediately

## Design approach

Uses three layers for maximum resilience across ChatGPT updates:

1. **CSS custom property overrides** (`:root`) — catches anything
   ChatGPT controls via its theming system
2. **Semantic HTML selectors** (`nav`, `main`, `header`, `footer`,
   `data-message-author-role`) — stable across refactors
3. **Tailwind utility class overrides** (`.bg-white`, `.text-green-600`)
   — catches hardcoded class usage

`content.js` additionally fights ChatGPT's JavaScript-driven theme
resets via a MutationObserver that re-applies all CSS vars on every
DOM change, batched through `requestAnimationFrame`.

## Customisation

All design values are defined as CSS custom properties at the top
of `content.css` under the `CLAUDE DESIGN TOKENS` section.

```css
/* Example: swap coral to a different accent */
--cl-coral: #7B68EE;
```

## Known limitations

- ChatGPT's class names change frequently. If something breaks after
  a ChatGPT update, inspect the element in DevTools and update the
  relevant selector in `content.css`.

- DM Sans loads from Google Fonts. If ChatGPT's Content Security
  Policy blocks it, font injection silently fails — all other skin
  rules still apply normally.

- The skin forces dark mode to match Claude's dark interface. ChatGPT's
  own light/dark toggle is overridden while the skin is enabled.

## Toggle

Click the extension icon in the Chrome toolbar to enable/disable.
After toggling, click "Reload ChatGPT tab to apply" in the popup.
