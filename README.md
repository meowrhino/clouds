
# MEOWRHINO **CLOUDS**
_A tiny UI system to place interactive “clouds” on a canvas and open a **Fun Lab** popup to play with palettes & tags._

This README explains **how the project is wired**, the main **concepts & CSS variables**, and **how to modify or make it responsive** (esp. the cloud scale and the _Fun_ popup). It’s written so you can tweak everything fast without hunting through the code.

---

## 0) TL;DR for devs

- **It’s a plain static site** (HTML/CSS/JS). Open `index.html` directly or run a local server.
- Each big yellow shape is a **Cloud** (`.box` inside a `.pre-box`). The **`.pre-box` reserves aspect-ratio**; JS sizes everything from it.
- **Cloud outline** is a second layer sized by **`--cloud-stroke`** (a CSS variable). Keep it scalable with `clamp()`.
- **The Fun Lab popup** is a fixed panel you open with **“open fun”**, close with **“close fun”**. It reads **palettes and tags** from arrays and applies them to CSS variables on the `:root`.
- **Responsiveness** comes from (1) a **scale** factor computed in JS (`ASPECT`, `HEIGHT_FACTOR`) and (2) CSS clamp variables. For phones, we switch to a **compact layout** for the popup and increase **minimum cloud scale** so buttons are tappable.

If you only need to change sizes/colors, look for the variables at the top of **`css/styles.css`** _and_ the constants at the top of **`js/app.js`**.

---

## 1) Project structure

_Your zip may differ slightly; these are the important pieces._

```
/ (root)
├─ index.html                # main page
├─ css/
│  └─ styles.css             # all cloud and popup styles (+ CSS variables)
├─ js/
│  ├─ app.js                 # sizing, placement, events (open/close Fun Lab)
│  └─ palettes.js            # arrays of palette names & tags shown in the Lab
├─ assets/                   # optional images, icons
└─ README.md                 # this file
```

### Key DOM elements & classes

- `.clouds-container` – wrapper that holds many clouds (and a dots layer).
- `.pre-box` – an invisible **ratio box** that fixes layout; **never remove**. `aspect-ratio` comes from CSS var `--cloud-ratio` or from JS constants.
- `.box` / `.box--palette` – the **visible cloud**; has inner content (buttons/chips).
- `.popup-trigger` – the **open fun** text/button.
- `#fun` (or `.fun-panel`) – the **Fun Lab** popup. Inside it we render:
  - **palette chips** (e.g. `ketchup`, `coolCap`, `autumnWinter`, …)
  - **tag buttons**
  - **color swatches**
  - **utility buttons** like “remover nubes”

There’s also an optional `.dot-container` that paints background dots (pure cosmetic).

---

## 2) How the Cloud sizing works (very important)

The size of each cloud is **derived** from the **`.pre-box`** using **aspect-ratio** plus a few constants:

```js
// js/app.js (top)
const ASPECT = 1.6;        // 16:10 feels right on desktop
const HEIGHT_FACTOR = 1.0; // vertical scale; 0.75 would squash
```

In CSS you’ll see the same idea:

```css
:root {
  --cloud-ratio: 16/10; /* pre-box aspect ratio (used by .pre-box) */
  --cloud-stroke: clamp(6px, 1.2vw, 22px); /* outline thickness */
  --cloud-radius: 48px; /* base roundness used in the blob */
}
.pre-box { aspect-ratio: var(--cloud-ratio); }
```

**Why two layers?**
- The **`.pre-box`** defines geometry without caring about content. It prevents reflow collapse and keeps the cloud proportion correct.
- The **`.box`** sits **on top**, reading the bounding size to draw the **cloud shape + outline** (via CSS or a pseudo-element).

**`data-fixed`**
If a `.pre-box` has `data-fixed="1"`, we keep its computed size and avoid fluid re-scaling (useful for hero clouds).

**Common “flattened after reload” issue**
If you ever see the cloud look “aplastado” after a normal reload, it’s usually that sizing code ran **before layout settled**. The robust fix is:
- Run the sizing _after_ `window.load` **and** on a `ResizeObserver` of the container.
- Debounce resize handlers.
- Ensure fonts are loaded before measurement if the layout depends on font metrics.

This repo’s `updateAll()` should be wired accordingly:
```js
window.addEventListener('load', updateAll);
new ResizeObserver(updateAll).observe(document.querySelector('.clouds-container'));
```

---

## 3) The Fun Lab popup (palettes & tags)

### What it does
- Shows **palette names** and **tags** as small buttons.
- Clicking a palette applies a set of CSS variables on `:root` (e.g. `--accent`, `--bg-1`, etc.).
- Clicking a tag may toggle extra styles or content filters.
- State can be stored in `localStorage` so a refresh keeps your last palette.

### Where to change content
- **`js/palettes.js`**: edit arrays for palettes & tags.
- **`css/styles.css`**: the mapping from palettes → CSS variables.

### Positioning
- The trigger (`open fun`) is fixed to the **bottom-right** of the viewport.
- The popup itself is a fixed panel with a width/height based on `clamp()` so it’s usable on both desktop and mobile.

---

## 4) Styling the Outline (“borde”)

To keep the white outline visible at all sizes, use a scalable thickness:
```css
:root {
  --cloud-stroke: clamp(6px, 1.2vw, 22px);
  --cloud-fill: #f7d274;
  --cloud-stroke-color: #fff8f0;
}

.box--palette {
  position: relative;
  background: var(--cloud-fill);
  border-radius: 999px; /* final cloud is a composition; this is a sane default */
  filter:
    drop-shadow(0 0 0 var(--cloud-stroke-color)) /* faux stroke */
    drop-shadow(0 10px 0 rgba(0,0,0,.18));       /* soft shadow */
}
```
If you’re composing the cloud from multiple lobes (circles), keep the **outline** on a **single wrapper** using `filter: drop-shadow(0 0 0 color)` or a `::before` pseudo-element expanded by `--cloud-stroke`. That prevents gaps and avoids the “border disappears under 1200px” issue.

---

## 5) Responsiveness plan (clouds + Fun popup)

The desktop layout (~≥1200px) already looks great. Below that, two problems appear:
1. The **white outline** may clip or vanish.
2. The **Fun popup** overflows, hiding buttons.

### 5.1 Breakpoints

Use three:
- **≥1200px**: current desktop behavior.
- **768–1199px**: tablet; smaller popup and tighter cloud padding.
- **≤480px**: mobile-compact; clouds scale up to keep labels tappable and the popup becomes a centered sheet.

```css
/* Base (desktop-ish) */
#fun { 
  position: fixed;
  right: clamp(12px, 3vw, 32px);
  bottom: clamp(12px, 3vh, 32px);
  width: clamp(420px, 38vw, 640px);
  max-height: min(78vh, 720px);
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 24px;
  padding: 16px 18px 20px;
  background: var(--cloud-fill);
  filter: drop-shadow(0 0 0 var(--cloud-stroke-color)) drop-shadow(0 8px 0 rgba(0,0,0,.18));
  z-index: 999;
}

/* Tablet */
@media (max-width: 1199px) {
  #fun { width: clamp(360px, 55vw, 520px); }
  .box--palette { padding: clamp(10px, 2.2vw, 18px); }
}

/* Mobile compact */
@media (max-width: 480px) {
  #fun {
    left: 50%;
    right: auto;
    bottom: calc(env(safe-area-inset-bottom) + 10px);
    transform: translateX(-50%);
    width: 92vw;
    max-height: 72vh;
    border-radius: 20px;
  }
  .box--palette { 
    --cloud-stroke: clamp(8px, 2.4vw, 18px);
    padding: 12px;
  }
  .box--palette .chip, .box--palette button { 
    font-size: 14px;
    min-height: 32px;
  }
}
```

### 5.2 Minimum readable cloud scale on phones

If the computed cloud width is too small, enforce a **min scale** in JS so buttons don’t become microscopic:

```js
function fitCloud(el) {
  const bounds = el.getBoundingClientRect();
  const minW = 320; // minimum width to keep chips readable
  const scale = Math.max(1, minW / bounds.width);
  el.style.transform = `scale(${scale})`;
  el.style.transformOrigin = 'top center';
}
```

Call `fitCloud()` inside `updateAll()` for every major cloud on small breakpoints.

### 5.3 Prevent inner content from being “eaten”

Clouds usually have an **irregular inner shape**. Give the inner content a **safe padding** and allow vertical scroll if necessary:

```css
.box--palette .inner {
  padding: clamp(10px, 2vw, 24px) clamp(14px, 2.5vw, 28px);
  max-height: 60vh;      /* especially inside the Fun popup */
  overflow: auto;         /* so chips don't get cut */
  scrollbar-gutter: stable both-edges;
}
```

---

## 6) Open/Close Fun and fixed trigger

You wanted the **“open fun”** trigger fixed bottom-right with a responsive size:
```css
.open-fun {
  position: fixed;
  right: clamp(10px, 3vw, 24px);
  bottom: clamp(12px, 4vh, 28px);
  font-size: clamp(16px, 2.2vw, 22px);
  z-index: 998;
}
```
If you need the older rounded **contour** around it, wrap it in a tiny cloud (`.pre-box` + `.box`) and apply the same drop-shadow outline technique.

---

## 7) Known pitfalls & how to avoid them

- **Fonts loading late** → sizes jump → outline misaligns.  
  _Fix_: run `updateAll()` on `window.load` and after `document.fonts.ready`.
- **Outline vanishes <1200px** because it was drawn with multiple sub-blobs.  
  _Fix_: draw outline once on a wrapper using `drop-shadow` or a pseudo-element.
- **Buttons clipped by cloud edge**.  
  _Fix_: increase inner padding, allow internal scroll, and/or raise min scale (5.2).
- **Hard refresh “fixes” things**.  
  _Fix_: add `ResizeObserver` + `requestAnimationFrame` around measurements.

---

## 8) Quick start (dev)

1. Open the folder in VS Code.  
2. Start a server (recommended):  
   - With the **Live Server** extension, right‑click `index.html` → “Open with Live Server”.  
   - Or from a terminal: `python3 -m http.server 8080` and open `http://localhost:8080`.
3. Edit palettes in `js/palettes.js` and styles in `css/styles.css`.
4. Tweak sizes in `js/app.js` (`ASPECT`, `HEIGHT_FACTOR`) and re-run.

---

## 9) Where to change what (cheat sheet)

| I want to… | Edit here |
| --- | --- |
| Add/remove palette names | `js/palettes.js` |
| Change colors applied by a palette | `css/styles.css` (CSS variables mapping) |
| Change cloud proportions | `js/app.js` (`ASPECT`, `HEIGHT_FACTOR`) or `:root{ --cloud-ratio }` |
| Make outline thicker/thinner | `:root{ --cloud-stroke }` |
| Move/resize the popup | `#fun` rules in `css/styles.css` |
| Fix trigger bottom-right + responsive | `.open-fun` rules |
| Increase tappable size on phones | JS `fitCloud()` + mobile `@media` rules |
| Stop clouds from clipping the inner UI | `.box--palette .inner` padding & `overflow:auto` |

---

## 10) Minimal responsive patch (you can paste now)

Paste this at the end of **`css/styles.css`** and adjust names if needed:

```css
/* === Responsive patch (clouds + Fun popup) === */

:root{
  --cloud-stroke: clamp(6px, 1.4vw, 22px);
  --cloud-ratio: 16/10;
}

.open-fun{
  position: fixed;
  right: clamp(10px, 3vw, 24px);
  bottom: clamp(12px, 4vh, 28px);
  font-size: clamp(16px, 2.2vw, 22px);
  z-index: 998;
}

#fun{
  position: fixed;
  right: clamp(12px, 3vw, 32px);
  bottom: clamp(12px, 3vh, 32px);
  width: clamp(420px, 38vw, 640px);
  max-height: min(78vh, 720px);
  overflow: auto;
  padding: 16px 18px 20px;
  border-radius: 24px;
  background: var(--cloud-fill, #f7d274);
  filter: drop-shadow(0 0 0 var(--cloud-stroke-color, #fff8f0)) drop-shadow(0 8px 0 rgba(0,0,0,.18));
  z-index: 999;
}

.box--palette{
  position: relative;
  padding: clamp(10px, 2.2vw, 22px);
  filter: drop-shadow(0 0 0 var(--cloud-stroke-color, #fff8f0)) drop-shadow(0 10px 0 rgba(0,0,0,.18));
}

.box--palette .inner{
  padding: clamp(10px, 2vw, 24px) clamp(14px, 2.5vw, 28px);
  max-height: 60vh;
  overflow: auto;
  scrollbar-gutter: stable both-edges;
}

@media (max-width: 1199px){
  #fun{ width: clamp(360px, 55vw, 520px); }
}

@media (max-width: 480px){
  #fun{
    left: 50%;
    right: auto;
    bottom: calc(env(safe-area-inset-bottom) + 10px);
    transform: translateX(-50%);
    width: 92vw;
    max-height: 72vh;
    border-radius: 20px;
  }
  .box--palette{
    --cloud-stroke: clamp(8px, 2.4vw, 18px);
    padding: 12px;
  }
  .box--palette .chip, .box--palette button{
    font-size: 14px;
    min-height: 32px;
  }
}
```

And add this small helper near the end of **`js/app.js`** if you need the phone-scale guarantee:

```js
function fitCloud(el) {
  const rect = el.getBoundingClientRect();
  const minW = 320; // tune as needed
  const scale = Math.max(1, minW / rect.width);
  el.style.transform = `scale(${scale})`;
  el.style.transformOrigin = 'top center';
}

function updateAll() {
  // ... existing logic ...
  if (window.matchMedia('(max-width: 480px)').matches) {
    document.querySelectorAll('.box--palette').forEach(fitCloud);
  } else {
    document.querySelectorAll('.box--palette').forEach(el => el.style.transform = '');
  }
}

window.addEventListener('load', updateAll);
new ResizeObserver(updateAll).observe(document.querySelector('.clouds-container'));
```

---

## 11) Roadmap / TODO

- [ ] Migrate the cloud outline to a **single wrapper** (drop-shadow or `::before`) to avoid outline gaps.
- [ ] Add `document.fonts.ready.then(updateAll)` to eliminate “aplastado tras recargar”.
- [ ] Store chosen palette in `localStorage` and restore on page load.
- [ ] Optional: switch to **SVG clouds** (precise stroke) for pixel-perfect borders at any scale.
- [ ] Accessibility pass (focus rings for chips/buttons, `prefers-reduced-motion`).

---

## 12) License

MIT unless your repo specifies otherwise. Use freely inside the Meowrhino galaxy 🌥️🦏
