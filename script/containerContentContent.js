// === Config ===
const ROOT = document.querySelector(".container--content");
const BASE = "https://meowrhino.neocities.org/";
const DISABLED_CATEGORIES = new Set(["hidden"]); // añade aquí otras que quieras ocultar
// const CATEGORY_ORDER = ['main quests','side quests',"meowrhino's world",'fun apps','unfinished apps','texts','misc']; // opcional

const CATEGORY_STYLE = {
  "main quests":       { minVW: 16, maxVW: 28, factorMin: 0.9,  factorMax: 1.15, safeVW: 4, safeVH: 4, heightVH: 100 },
  "side quests":       { minVW: 12, maxVW: 24, factorMin: 0.85, factorMax: 1.2,  heightVH: 100 },
  "meowrhino's world": { minVW: 14, maxVW: 26, factorMin: 0.9,  factorMax: 1.2,  heightVH: 100 },
  "fun apps":          { minVW: 11, maxVW: 22, factorMin: 0.85, factorMax: 1.15, heightVH: 100 },
  "unfinished apps":   { minVW: 12, maxVW: 24, factorMin: 0.85, factorMax: 1.2,  heightVH: 100 },
  "texts":             { minVW: 13, maxVW: 23, factorMin: 0.9,  factorMax: 1.15, heightVH: 100 },
  "misc":              { minVW: 12, maxVW: 24, factorMin: 0.85, factorMax: 1.2,  heightVH: 100 },
  default:             { minVW: 12, maxVW: 24, factorMin: 0.85, factorMax: 1.2,  heightVH: 100 }
};

const SAFE_VW = 4;
const SAFE_VH = 4;

function getCatStyle(category) {
  const cfg = CATEGORY_STYLE[category] || CATEGORY_STYLE.default;
  return {
    minVW: cfg.minVW ?? 12,
    maxVW: cfg.maxVW ?? 24,
    factorMin: cfg.factorMin ?? 0.85,
    factorMax: cfg.factorMax ?? 1.2,
    safeVW: cfg.safeVW ?? SAFE_VW,
    safeVH: cfg.safeVH ?? SAFE_VH,
    heightVH: cfg.heightVH ?? 100
  };
}

// === Utilidades ===
function normalizeLink(link) {
  if (!link) return "#";
  const s = String(link).trim();
  if (/^(https?:|mailto:|tel:|\/\/|#)/i.test(s)) return s;
  return new URL(s, BASE).toString();
}
function getRandomFactor() {
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  return isMobile ? 0.65 + Math.random() * 1.0 : 0.85 + Math.random() * 1.2;
}
function roman(n) {
  return ["i", "ii", "iii", "iv", "v"][n - 1] || String(n);
}

// === Núcleo: crear UNA nube dentro de un contenedor dado ===
function createCloud(item, containerEl, category) {
  const pre = document.createElement("div");
  pre.className = "pre-box";
  const box = document.createElement("div");
  box.className = "box box--title";

  const links = Array.isArray(item.links) ? item.links : [];

  if (links.length <= 1) {
    const h5 = document.createElement("h5");
    const a = document.createElement("a");
    a.href = normalizeLink(links[0] || "#");
    a.textContent = item.name || "(sin nombre)";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    h5.appendChild(a);
    box.appendChild(h5);
  } else {
    box.classList.add("flex-column");
    const h4 = document.createElement("h4");
    h4.textContent = item.name || "(sin nombre)";
    box.appendChild(h4);

    const p = document.createElement("p");
    links.forEach((lnk, i) => {
      const span = document.createElement("span");
      const a = document.createElement("a");
      a.href = normalizeLink(lnk);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = roman(i + 1);
      span.appendChild(a);
      p.appendChild(span);
    });
    box.appendChild(p);
  }

  // ---- tamaño y posición con vw/vh (sin tocar tu CSS global) ----
  // usamos aspect-ratio para mantener la forma; ancho en vw
  const widthVW = (12 + Math.random() * 12) * getRandomFactor(); // ~12–24vw
  pre.style.width = `${widthVW}vw`;
  pre.style.aspectRatio = "1.55 / 1"; // height = width / 1.55
  pre.style.position = "absolute";

  // para el bounding vertical en vh necesitamos saber la altura equivalente en vh:
  const heightVH = (widthVW * (window.innerWidth / window.innerHeight)) / 1.55;
  const leftVW = Math.max(0, Math.random() * (100 - widthVW));
  const topVH = Math.max(0, Math.random() * (100 - heightVH));

  pre.style.left = `${leftVW}vw`;
  pre.style.top = `${topVH}vh`;

  // el contenido ocupa todo el pre
  box.style.width = "100%";
  box.style.height = "100%";

  pre.appendChild(box);
  containerEl.appendChild(pre);
}

// === Recolocar (en resize/zoom) todas las nubes con vw/vh ===
function updateAll() {
  document.querySelectorAll(".clouds-container").forEach((cont) => {
    cont.querySelectorAll(".pre-box").forEach((pre) => {
      // recalcular solo el top (vh) porque el aspect depende de la relación W/H del viewport
      const widthVW = parseFloat(pre.style.width);
      const heightVH =
        (widthVW * (window.innerWidth / window.innerHeight)) / 1.55;
      const leftVW = parseFloat(pre.style.left) || 0;
      const topVH = Math.max(
        0,
        Math.min(parseFloat(pre.style.top) || 0, 100 - heightVH)
      );
      pre.style.left = `${leftVW}vw`;
      pre.style.top = `${topVH}vh`;
    });
  });
}

// throttle sencillo
function throttle(fn, ms) {
  let lock = false;
  return (...args) => {
    if (lock) return;
    lock = true;
    fn(...args);
    setTimeout(() => (lock = false), ms);
  };
}

function watchZoomResize() {
  let last = window.devicePixelRatio;
  setInterval(() => {
    if (window.devicePixelRatio !== last) {
      last = window.devicePixelRatio;
      updateAll();
    }
  }, 200);
  window.addEventListener("resize", throttle(updateAll, 200));
}

// === Render por categorías: crea un contenedor 100vh por categoría ===
function renderByCategory(rawData) {
  // 1) Normaliza a {cat: [items]}
  let byCat = {};
  if (Array.isArray(rawData)) {
    rawData.forEach(it => {
      const c = it.category || 'uncategorized';
      (byCat[c] ||= []).push(it);
    });
  } else {
    byCat = rawData || {};
  }

  // 2) Orden opcional
  let entries = Object.entries(byCat);
  if (typeof CATEGORY_ORDER !== 'undefined' && Array.isArray(CATEGORY_ORDER) && CATEGORY_ORDER.length) {
    const rank = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
    entries.sort((a, b) => (rank.get(a[0]) ?? 1e9) - (rank.get(b[0]) ?? 1e9));
  }

  // 3) Filtra desactivadas (p. ej. "hidden")
  const enabled = entries.filter(([cat]) => !DISABLED_CATEGORIES.has(cat));

  // Altura total = suma de alturas por categoría
  const totalVh = enabled.reduce((sum, [cat]) => sum + (getCatStyle(cat).heightVH || 100), 0);
  ROOT.style.height = `${totalVh}vh`;
  ROOT.style.setProperty("--sections", String(enabled.length)); // por compat
  const wrapper = ROOT.closest('.container');
  if (wrapper) wrapper.style.minHeight = `${totalVh}vh`;

  // 5) Pinta secciones 100vh por categoría
  ROOT.innerHTML = '';
  enabled.forEach(([category, items]) => {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.dataset.category = category;

    // sección pantalla completa sin depender del CSS externo
    const stCat = getCatStyle(category);
    section.style.height = `${stCat.heightVH}vh`;
    section.style.width = '100vw';
    section.style.position = 'relative';
    section.style.overflow = 'hidden';

    // Título de categoría (arriba-izquierda con 10vh / 10vh)
    const title = document.createElement('h3');
    title.className = 'category-title';
    title.textContent = category;
    title.style.position = 'absolute';
    title.style.top = '10vh';
    title.style.left = '10vh';
    title.style.zIndex = '2';
    title.style.pointerEvents = 'none';
    title.style.fontSize = 'clamp(18px, 3.5vw, 32px)';
    section.appendChild(title);

    const clouds = document.createElement('div');
    clouds.className = 'clouds-container';
    clouds.style.position = 'relative';
    clouds.style.width = '100%';
    clouds.style.height = '100%';

    (items || []).forEach(it => createCloud(it, clouds, category));

    section.appendChild(clouds);
    ROOT.appendChild(section);
  });

  updateAll();
  watchZoomResize();
}

// === Inicio ===
fetch("proyectos.json")
  .then((r) => r.json())
  .then(renderByCategory)
  .catch((e) => console.error("Error cargando proyectos:", e));
