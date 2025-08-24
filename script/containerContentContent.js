// === Config ===
const ROOT = document.querySelector(".container--content");
const BASE = "https://meowrhino.neocities.org/";
const DISABLED_CATEGORIES = new Set(["hidden"]); // añade aquí otras que quieras ocultar
// const CATEGORY_ORDER = ['main quests','side quests',"meowrhino's world",'fun apps','unfinished apps','texts','misc']; // opcional

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
function createCloud(item, containerEl) {
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

  // 4) *** Alto automático ***
  // Cada sección mide 100vh -> total = N * 100vh
  const totalVh = enabled.length * 100;
  // Fijamos la altura en el propio contenedor de contenido (igual que hacías con 500vh)
  ROOT.style.height = `${totalVh}vh`;
  // Por si el wrapper .container tuviera height:100vh, le damos un mínimo para que no recorte
  const wrapper = ROOT.closest('.container');
  if (wrapper) wrapper.style.minHeight = `${totalVh}vh`;

  // 5) Pinta secciones 100vh por categoría
  ROOT.innerHTML = '';
  enabled.forEach(([category, items]) => {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.dataset.category = category;

    // sección pantalla completa sin depender del CSS externo
    section.style.height = '100vh';
    section.style.width = '100vw';
    section.style.position = 'relative';
    section.style.overflow = 'hidden';

    const clouds = document.createElement('div');
    clouds.className = 'clouds-container';
    clouds.style.position = 'relative';
    clouds.style.width = '100%';
    clouds.style.height = '100%';

    (items || []).forEach(it => createCloud(it, clouds));

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
