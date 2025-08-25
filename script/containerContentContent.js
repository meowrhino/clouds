// === Config ===
const ROOT = document.querySelector(".container--content");
const BASE = "https://meowrhino.neocities.org/";
const DISABLED_CATEGORIES = new Set(["hidden"]); // añade aquí otras que quieras ocultar
// const CATEGORY_ORDER = ['main quests','side quests',"meowrhino's world",'fun apps','unfinished apps','texts','misc']; // opcional

const CATEGORY_STYLE = {
  __hero__: {
    minVW: 48,
    maxVW: 90,
    factorMin: 1.0,
    factorMax: 1.3,
    heightVH: 60,
    safeVW: 6,
    safeVH: 10,
    firstMobileScale: 1.4,
    firstScale: 1.2,
    heroScale: 1.3,
  },
  "main quests": {
    minVW: 40,
    maxVW: 80,
    factorMin: 0.9,
    factorMax: 1.5,
    heightVH: 100,
  },
  "side quests": {
    minVW: 20,
    maxVW: 40,
    factorMin: 0.85,
    factorMax: 1.2,
    heightVH: 100,
  },
  "meowrhino's world": {
    minVW: 20,
    maxVW: 40,
    factorMin: 0.9,
    factorMax: 1.2,
    heightVH: 50,
  },
  "fun apps": {
    minVW: 15,
    maxVW: 22,
    factorMin: 0.85,
    factorMax: 1.15,
    heightVH: 150,
  },
  "unfinished apps": {
    minVW: 16,
    maxVW: 24,
    factorMin: 0.85,
    factorMax: 1.2,
    heightVH: 100,
  },
  texts: {
    minVW: 13,
    maxVW: 23,
    factorMin: 0.9,
    factorMax: 1.15,
    heightVH: 100,
  },
  misc: {
    minVW: 12,
    maxVW: 24,
    factorMin: 0.85,
    factorMax: 1.2,
    heightVH: 100,
  },
  // valores por defecto y escalados generales
  default: {
    minVW: 12,
    maxVW: 24,
    factorMin: 0.85,
    factorMax: 1.2,
    heightVH: 100,
    complexScale: 1.5,
    firstMobileScale: 1.25,
    firstScale: 1.0,
    heroScale: 1.15,
  },
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
    heightVH: cfg.heightVH ?? 100,
    complexScale:
      cfg.complexScale ?? CATEGORY_STYLE.default?.complexScale ?? 1.5,
    firstMobileScale:
      cfg.firstMobileScale ?? CATEGORY_STYLE.default?.firstMobileScale ?? 1.25,
    firstScale: cfg.firstScale ?? CATEGORY_STYLE.default?.firstScale ?? 1.0,
    heroScale: cfg.heroScale ?? CATEGORY_STYLE.default?.heroScale ?? 1.15,
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

  // ---- tamaño y posición con vw/vh (sin tocar tu CSS global) ----
  // usamos aspect-ratio para mantener la forma; ancho en vw
  const st = getCatStyle(category);
  const factor = st.factorMin + Math.random() * (st.factorMax - st.factorMin);
  const linkCount = links.length;

  // tamaño base por categoría
  let widthVW = (st.minVW + Math.random() * (st.maxVW - st.minVW)) * factor;

  // heurística de escala: nubes "complejas" (con lista de enlaces)
  if (linkCount > 1) {
    widthVW *= st.complexScale; // ej. 1.5 por defecto
  } else if (linkCount > 5) {
    // compat con antiguo ensanchado (por si hay un título largo con 1 link)
    widthVW += Math.min(12, (linkCount - 5) * 0.9);
  }

  // primera nube de la sección más grande (sobre todo en móvil)
  const isFirstInSection =
    containerEl.querySelectorAll(".pre-box").length === 0;
  if (isFirstInSection) {
    widthVW *= st.firstScale;
    if (window.matchMedia("(max-width: 600px)").matches) {
      widthVW *= st.firstMobileScale; // ej. 1.25 por defecto
    }
  }

  // "hero" por nombre (ej: meowrhino)
  const nm = (item.name || "").toLowerCase();
  if (nm.includes("meowrhino")) {
    widthVW *= st.heroScale; // pequeño boost visual
  }

  pre.style.width = `${widthVW}vw`;
  pre.style.aspectRatio = "1.55 / 1"; // height = width / 1.55
  pre.style.position = "absolute";

  // mínimo razonable para evitar que títulos largos colapsen la nube
  widthVW = Math.max(widthVW, st.minVW);

  // para el bounding vertical en vh necesitamos saber la altura equivalente en vh:
  const heightVH = (widthVW * (window.innerWidth / window.innerHeight)) / 1.55;

  // Márgenes de seguridad para no pegar al borde
  const minLeft = st.safeVW;
  const maxLeft = Math.max(st.safeVW, 100 - widthVW - st.safeVW);
  const leftVW = minLeft + Math.random() * Math.max(0, maxLeft - minLeft);

  // Usar la altura de sección definida en CATEGORY_STYLE (por defecto 100vh)
  const sectionVH = st.heightVH || 100;
  const minTop = st.safeVH;
  const maxTop = Math.max(st.safeVH, sectionVH - heightVH - st.safeVH);
  const topVH = minTop + Math.random() * Math.max(0, maxTop - minTop);

  // guarda safes y altura de sección en data-* para reclampeo en resize
  pre.dataset.safeVw = String(st.safeVW);
  pre.dataset.safeVh = String(st.safeVH);
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
      if (pre.dataset.fixed === "1") return;
      const widthVW = parseFloat(pre.style.width);
      const heightVH =
        (widthVW * (window.innerWidth / window.innerHeight)) / 1.55;

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
  const items = Array.from(section.querySelectorAll(".pre-box:not([data-fixed='1'])"));
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
          const ah = (aw * (window.innerWidth / window.innerHeight)) / 1.55;
          const bw = parseFloat(b.style.width);
          const bh = (bw * (window.innerWidth / window.innerHeight)) / 1.55;

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
  const heroStyle = getCatStyle("__hero__");
  const totalVh =
    (HERO_ENABLED ? heroStyle.heightVH || 60 : 0) +
    enabled.reduce((sum, [cat]) => sum + (getCatStyle(cat).heightVH || 100), 0);
  ROOT.style.height = `${totalVh}vh`;
  ROOT.style.setProperty("--sections", String(enabled.length)); // por compat
  const wrapper = ROOT.closest(".container");
  if (wrapper) wrapper.style.minHeight = `${totalVh}vh`;

  // Reubica el fondo de puntos dentro de ROOT y estíralo a todo el alto
  const dot = document.querySelector(".dot-container");
  if (dot) {
    dot.style.position = "absolute";
    dot.style.inset = "0";
    dot.style.width = "100%";
    dot.style.height = "100%";
    dot.style.minHeight = "100%";
    dot.style.zIndex = "0";
    dot.style.pointerEvents = "none";
  }

  // 5) Pinta secciones 100vh por categoría
  ROOT.innerHTML = "";
  if (dot) ROOT.prepend(dot); // queda como primer hijo (fondo)

  // Inserta la sección HERO al principio
  if (HERO_ENABLED) {
    const section = document.createElement("section");
    section.className = "category-section";
    section.dataset.category = "__hero__";

    const stHero = getCatStyle("__hero__");
    section.style.height = `${stHero.heightVH}vh`;
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
    const stCat = getCatStyle(category);
    section.style.height = `${stCat.heightVH}vh`;
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
}

// === Inicio ===
fetch("proyectos.json")
  .then((r) => r.json())
  .then(renderByCategory)
  .catch((e) => console.error("Error cargando proyectos:", e));
