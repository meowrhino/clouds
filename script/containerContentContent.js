// === Config ===
const ROOT = document.querySelector(".container--content");
const BASE = "https://meowrhino.neocities.org/";
const DISABLED_CATEGORIES = new Set(["hidden"]); // añade aquí otras que quieras ocultar
// const CATEGORY_ORDER = ['main quests','side quests',"meowrhino's world",'fun apps','unfinished apps','texts','misc']; // opcional

// === CONFIG SÚPER SIMPLE ===
const CAT_SIZE = {
  __hero__: 36, // ancho base en vw
  "main quests": 30,
  "side quests": 10,
  "meowrhino's world": 24,
  "fun apps": 8,
  "unfinished apps": 8,
  texts: 10,
  misc: 10,
  default: 22,
};

const CAT_SECTION_VH = {
  __hero__: 100,
  "fun apps": 150,
  misc: 150,
  default: 100,
};

// Diales globales
const ASPECT = 1.6; // relación ancho/alto de la nube (16:10)
const HEIGHT_FACTOR = 1; // no aplastar: manda aspect-ratio
const SAFE_VW = 4;
const SAFE_VH = 4;

// variación de tamaño y escala global
const SIZE_RANGE = { min: 0.95, max: 1.55 }; // 95%..155%
const GLOBAL_SCALE = 1.2; // amplía todas las nubes (excepto hero)

function sizeFor(cat) {
  return CAT_SIZE[cat] ?? CAT_SIZE.default;
}
function sectionVHFor(cat) {
  return CAT_SECTION_VH[cat] ?? CAT_SECTION_VH.default;
}
function randSize(base) {
  const f = SIZE_RANGE.min + Math.random() * (SIZE_RANGE.max - SIZE_RANGE.min);
  return base * f;
}

// === Utilidades ===
function normalizeLink(link) {
  if (!link) return "#";
  const s = String(link).trim();
  if (/^(https?:|mailto:|tel:\/\/|\/\/|#)/i.test(s)) return s;
  return new URL(s, BASE).toString();
}
function getRandomFactor() {
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  return isMobile ? 0.65 + Math.random() * 1.0 : 0.85 + Math.random() * 1.2;
}
// Romanos hasta 3999 (minúsculas)
function romanize(n) {
  if (!Number.isFinite(n) || n <= 0) return String(n);
  const table = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];
  let res = "",
    num = Math.floor(n);
  for (const [sym, val] of table) {
    while (num >= val) {
      res += sym;
      num -= val;
    }
  }
  return res.toLowerCase();
}

function ensureDotContainer() {
  let dot = document.getElementById("dot-container");
  if (!dot) {
    dot = document.createElement("div");
    dot.id = "dot-container";
    dot.className = "dot-container";
    dot.style.position = "absolute";
    dot.style.left = "0";
    dot.style.top = "0";
    dot.style.width = "100%";
    dot.style.zIndex = "0";
    dot.style.pointerEvents = "none";
    document.body.prepend(dot);
  }
  // altura real del documento
  const h = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  dot.style.height = `${h}px`;
  return dot;
}

// === Núcleo: crear UNA nube dentro de un contenedor dado ===
function createCloud(item, containerEl, category) {
  const pre = document.createElement("div");
  pre.className = "pre-box";
  const box = document.createElement("div");
  box.className = "box box--title";

  // Compacta y centra el contenido de la nube
  box.style.display = "flex";
  box.style.flexDirection = "column";
  box.style.alignItems = "center";
  box.style.justifyContent = "center";

  const links = Array.isArray(item.links) ? item.links : [];

  if (links.length <= 1) {
    if (category === "__hero__") {
      // HERO: H1 sin <a>
      const h1 = document.createElement("h1");
      h1.textContent = item.name || "(sin nombre)";
      h1.style.margin = "0";
      box.appendChild(h1);
    } else {
      // Resto: mantiene h5 + link
      const h5 = document.createElement("h5");
      const a = document.createElement("a");
      a.href = normalizeLink(links[0] || "#");
      a.textContent = item.name || "(sin nombre)";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      h5.appendChild(a);
      h5.style.margin = "0";
      a.style.display = "inline-block";
      a.style.lineHeight = "1";
      box.appendChild(h5);
    }
  } else {
    box.classList.add("flex-column");
    const h4 = document.createElement("h4");
    h4.style.margin = "0 0 0.25em";
    h4.style.lineHeight = "1.1";
    h4.textContent = item.name || "(sin nombre)";
    box.appendChild(h4);

    const p = document.createElement("p");
    p.style.margin = "0";
    p.style.display = "flex";
    p.style.flexWrap = "wrap";
    p.style.alignItems = "center";
    p.style.justifyContent = "center";
    p.style.gap = "6px";
    p.style.lineHeight = "1";

    links.forEach((lnk, i) => {
      const span = document.createElement("span");
      const a = document.createElement("a");
      a.href = normalizeLink(lnk);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.display = "inline-block";
      a.style.lineHeight = "1";
      a.textContent = romanize(i + 1);
      span.appendChild(a);
      p.appendChild(span);
    });
    box.appendChild(p);
  }

  // ---- tamaño y posición con vw/vh (versión simple) ----
  const baseVW =
    sizeFor(category) * (category === "__hero__" ? 1 : GLOBAL_SCALE);
  const widthVW = randSize(baseVW);

  // altura SOLO para cálculos (no se asigna inline)
  const heightVH =
    (widthVW / ASPECT) *
    (window.innerWidth / window.innerHeight) *
    HEIGHT_FACTOR;

  // aplica tamaño y fallback de aspect-ratio (evita “aplastado” si el CSS tarda)
  pre.style.width = `${widthVW}vw`;
  pre.style.removeProperty("height");
  pre.style.position = "absolute";
  pre.style.aspectRatio = ASPECT; // fallback
  pre.style.setProperty("--cloud-ratio", ASPECT);

  // márgenes de seguridad y altura de sección
  const sectionVH = sectionVHFor(category);
  const minLeft = SAFE_VW;
  const maxLeft = Math.max(SAFE_VW, 100 - widthVW - SAFE_VW);
  const leftVW = minLeft + Math.random() * Math.max(0, maxLeft - minLeft);

  const minTop = SAFE_VH;
  const maxTop = Math.max(SAFE_VH, sectionVH - heightVH - SAFE_VH);
  const topVH = minTop + Math.random() * Math.max(0, maxTop - minTop);

  // guarda safes y altura de sección en data-* para reclampeo en resize
  pre.dataset.safeVw = String(SAFE_VW);
  pre.dataset.safeVh = String(SAFE_VH);
  pre.dataset.sectionVh = String(sectionVH);

  pre.style.left = `${leftVW}vw`;
  pre.style.top = `${topVH}vh`;

  // el contenido ocupa todo el pre
  box.style.width = "100%";
  box.style.height = "100%";

  pre.appendChild(box);
  containerEl.appendChild(pre);
  return pre;
}

// === Recolocar (en resize/zoom) todas las nubes con vw/vh ===
function updateAll() {
  document.querySelectorAll(".clouds-container").forEach((cont) => {
    cont.querySelectorAll(".pre-box").forEach((pre) => {
      const widthVW = parseFloat(pre.style.width);
      const heightVH =
        (widthVW / ASPECT) *
        (window.innerWidth / window.innerHeight) *
        HEIGHT_FACTOR;

      // Asegura ratio y limpia cualquier height inline SIEMPRE
      pre.style.aspectRatio = ASPECT;
      pre.style.setProperty("--cloud-ratio", ASPECT);
      pre.style.removeProperty("height");

      // no muevas las fijas (hero), pero ya les quitamos height arriba
      if (pre.dataset.fixed === "1") return;

      // valores actuales
      let leftVW = parseFloat(pre.style.left) || SAFE_VW;
      let topVH = parseFloat(pre.style.top) || SAFE_VH;

      // márgenes por elemento (data-*) y altura de sección
      const elSafeVW = parseFloat(pre.dataset.safeVw || "") || SAFE_VW;
      const elSafeVH = parseFloat(pre.dataset.safeVh || "") || SAFE_VH;
      const sectionVH = parseFloat(pre.dataset.sectionVh || "") || 100;

      // límites dentro de la sección
      const minLeft = elSafeVW;
      const maxLeft = Math.max(elSafeVW, 100 - widthVW - elSafeVW);
      const minTop = elSafeVH;
      const maxTop = Math.max(elSafeVH, sectionVH - heightVH - elSafeVH);

      // clampea y aplica
      leftVW = Math.min(Math.max(leftVW, minLeft), maxLeft);
      topVH = Math.min(Math.max(topVH, minTop), maxTop);

      pre.style.left = `${leftVW}vw`;
      pre.style.top = `${topVH}vh`;
    });
  });
  // tras recolocar, alisa colisiones en cada sección
  document
    .querySelectorAll(".category-section")
    .forEach(resolveOverlapsInSection);
}

// --- Colisión simple: separa nubes que se pisan dentro de una sección ---
function pxToVw(px) {
  return (px / window.innerWidth) * 100;
}
function pxToVh(px) {
  return (px / window.innerHeight) * 100;
}

function resolveOverlapsInSection(section, iterations = 120) {
  const items = Array.from(
    section.querySelectorAll(".pre-box:not([data-fixed='1'])")
  );
  if (items.length < 2) return;

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  for (let step = 0; step < iterations; step++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      const ra = a.getBoundingClientRect();
      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        const rb = b.getBoundingClientRect();

        // chequeo de intersección AABB
        const overlapX = Math.max(
          0,
          Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
        );
        const overlapY = Math.max(
          0,
          Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
        );
        if (overlapX > 0 && overlapY > 0) {
          // empuje mínimo en direcciones opuestas
          const pushX = pxToVw(overlapX / 2 + 1);
          const pushY = pxToVh(overlapY / 2 + 1);

          const aw = parseFloat(a.style.width);
          const ah =
            (aw / ASPECT) *
            (window.innerWidth / window.innerHeight) *
            HEIGHT_FACTOR;
          const bw = parseFloat(b.style.width);
          const bh =
            (bw / ASPECT) *
            (window.innerWidth / window.innerHeight) *
            HEIGHT_FACTOR;

          const aSafeW = parseFloat(a.dataset.safeVw || "0");
          const aSafeH = parseFloat(a.dataset.safeVh || "0");
          const bSafeW = parseFloat(b.dataset.safeVw || "0");
          const bSafeH = parseFloat(b.dataset.safeVh || "0");

          // mueve en ejes
          let aLeft = parseFloat(a.style.left) || aSafeW;
          let aTop = parseFloat(a.style.top) || aSafeH;
          let bLeft = parseFloat(b.style.left) || bSafeW;
          let bTop = parseFloat(b.style.top) || bSafeH;

          const acx = (ra.left + ra.right) / 2,
            acy = (ra.top + ra.bottom) / 2;
          const bcx = (rb.left + rb.right) / 2,
            bcy = (rb.top + rb.bottom) / 2;
          const dirX = Math.sign(acx - bcx) || (Math.random() < 0.5 ? -1 : 1);
          const dirY = Math.sign(acy - bcy) || (Math.random() < 0.5 ? -1 : 1);

          aLeft = clamp(
            aLeft + dirX * pushX,
            aSafeW,
            Math.max(aSafeW, 100 - aw - aSafeW)
          );
          bLeft = clamp(
            bLeft - dirX * pushX,
            bSafeW,
            Math.max(bSafeW, 100 - bw - bSafeW)
          );
          aTop = clamp(
            aTop + dirY * pushY,
            aSafeH,
            Math.max(aSafeH, 100 - ah - aSafeH)
          );
          bTop = clamp(
            bTop - dirY * pushY,
            bSafeH,
            Math.max(bSafeH, 100 - bh - bSafeH)
          );

          a.style.left = `${aLeft}vw`;
          a.style.top = `${aTop}vh`;
          b.style.left = `${bLeft}vw`;
          b.style.top = `${bTop}vh`;

          moved = true;
        }
      }
    }
    if (!moved) break;
  }
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
    rawData.forEach((it) => {
      const c = it.category || "uncategorized";
      (byCat[c] ||= []).push(it);
    });
  } else {
    byCat = rawData || {};
  }

  // 2) Orden opcional
  let entries = Object.entries(byCat);
  if (
    typeof CATEGORY_ORDER !== "undefined" &&
    Array.isArray(CATEGORY_ORDER) &&
    CATEGORY_ORDER.length
  ) {
    const rank = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
    entries.sort((a, b) => (rank.get(a[0]) ?? 1e9) - (rank.get(b[0]) ?? 1e9));
  }

  // 3) Filtra desactivadas (p. ej. "hidden")
  const enabled = entries.filter(([cat]) => !DISABLED_CATEGORIES.has(cat));

  // Hero y altura total (héroe + categorías)
  const HERO_ENABLED = true;
  const totalVh =
    (HERO_ENABLED ? sectionVHFor("__hero__") : 0) +
    enabled.reduce((sum, [cat]) => sum + sectionVHFor(cat), 0);
  ROOT.style.height = `${totalVh}vh`;
  ROOT.style.setProperty("--sections", String(enabled.length)); // por compat
  const wrapper = ROOT.closest(".container");
  if (wrapper) wrapper.style.minHeight = `${totalVh}vh`;

  // 5) Pinta secciones 100vh por categoría
  ROOT.innerHTML = "";

  // Inserta la sección HERO al principio
  if (HERO_ENABLED) {
    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.category = "__hero__";

    section.style.height = `${sectionVHFor("__hero__")}vh`;
    section.style.width = "100vw";
    section.style.position = "relative";
    section.style.overflow = "visible";
    section.style.zIndex = "1";

    const clouds = document.createElement("div");
    clouds.className = "clouds-container";
    clouds.style.position = "relative";
    clouds.style.width = "100%";
    clouds.style.height = "100%";

    const heroItem = { name: "meowrhino", links: [] };
    const heroPre = createCloud(heroItem, clouds, "__hero__");
    if (heroPre) heroPre.dataset.fixed = "1"; // que no lo mueva el random

    section.appendChild(clouds);
    ROOT.appendChild(section);
  }

  enabled.forEach(([category, items]) => {
    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.category = category;

    // sección pantalla completa sin depender del CSS externo
    section.style.height = `${sectionVHFor(category)}vh`;
    section.style.width = "100vw";
    section.style.position = "relative";
    section.style.overflow = "visible";
    section.style.zIndex = "1";

    // Título de categoría (arriba-izquierda con 10vh / 10vh)
    const title = document.createElement("h3");
    title.className = "category-title";
    title.textContent = category;
    title.style.position = "absolute";
    title.style.top = "10vh";
    title.style.left = "10vh";
    title.style.zIndex = "2";
    title.style.pointerEvents = "none";
    title.style.fontSize = "clamp(18px, 3.5vw, 32px)";
    section.appendChild(title);

    const clouds = document.createElement("div");
    clouds.className = "clouds-container";
    clouds.style.position = "relative";
    clouds.style.width = "100%";
    clouds.style.height = "100%";

    (items || []).forEach((it) => createCloud(it, clouds, category));

    section.appendChild(clouds);
    // arregla solapes iniciales de esta sección
    resolveOverlapsInSection(section);
    ROOT.appendChild(section);
  });

  updateAll();
  watchZoomResize();

  // doble tick por si CSS/Fonts llegan tarde
  requestAnimationFrame(() => updateAll());
  if (document.fonts?.ready) document.fonts.ready.then(updateAll);

  // dots a altura total del documento
  ensureDotContainer();
  window.dispatchEvent(new Event("clouds:rendered"));
}

// === Inicio ===
fetch("proyectos.json")
  .then((r) => r.json())
  .then(renderByCategory)
  .catch((e) => console.error("Error cargando proyectos:", e));
