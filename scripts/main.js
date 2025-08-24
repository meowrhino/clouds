// scripts/main.js
window.addEventListener("DOMContentLoaded", async () => {
  // 1) Cargo proyectos y el placeholder
  const [proyectos, visibility] = await Promise.all([
    fetch("proyectos.json").then((r) => r.json()),
    fetch("visibility.json").then((r) => r.json()),
  ]);
  // Creamos un mapa para buscar rápido por category
  const visMap = new Map(visibility.categories.map((c) => [c.category, c]));

  const app = document.getElementById("app");

  // 2) Parámetros globales
  const isMobile = window.innerWidth <= 600;
  const BASE_SIZE = isMobile ? 150 : 200;
  const MIN_SCALE = isMobile ? 0.4 : 0.6;
  const MAX_SCALE = isMobile ? 1.2 : 2.0;
  const nubeCoords = (() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--nube")
      .trim();
    return raw
      .replace(/^polygon\(|\)$/g, "")
      .split(",")
      .map((pt) => pt.trim().split(" "))
      .map(([x, y]) => [parseFloat(x) / 100, parseFloat(y) / 100]);
  })();

  // // 3) Creo secciones dinámicas
  // proyectos.forEach((cat, idx) => {
  //   const slug = cat.category
  //     .toLowerCase()
  //     .replace(/\s+/g, "_")
  //     .replace(/[^a-z0-9_]/g, "");
  //   // sección
  //   const sec = document.createElement("section");
  //   sec.className = `category-section category-${slug}`;
  //   sec.dataset.index = idx;
  //   sec.style.cssText = "position:relative;width:100%;height:100vh;";
  //   // canvas
  //   const canvas = document.createElement("canvas");
  //   canvas.className = "canvas-nubes";
  //   Object.assign(canvas.style, {
  //     position: "absolute",
  //     top: 0,
  //     left: 0,
  //     width: "100%",
  //     height: "100%",
  //   });
  //   sec.appendChild(canvas);
  //   // contenedor de labels
  //   const cont = document.createElement("div");
  //   cont.className = "container--content";
  //   Object.assign(cont.style, {
  //     position: "absolute",
  //     top: 0,
  //     left: 0,
  //     width: "100%",
  //     height: "100%",
  //     pointerEvents: "none",
  //   });
  //   sec.appendChild(cont);
  //   app.appendChild(sec);
  // });

  // 4) Función que, dada una sección, la inicializa
  //    catScale viene de visibility.json; default = 1 para compatibilidad
  function initSection(section, proyectosCat, catScale = 1) {
    const canvas = section.querySelector(".canvas-nubes");
    const container = section.querySelector(".container--content");
    const scope = new paper.PaperScope();
    scope.setup(canvas);

    function resize() {
      const w = section.clientWidth;
      const h = section.clientHeight;
      canvas.width = w;
      canvas.height = h;
      scope.view.viewSize = new scope.Size(w, h);
    }
    window.addEventListener("resize", resize);
    resize();

    function generaSemillas() {
      const maxW = BASE_SIZE * MAX_SCALE;
      const maxH = maxW * (10 / 16);
      const marginX = maxW / 2;
      const marginY = maxH / 2;

      return proyectosCat.map((p) => {
        // escala base aleatoria
        const baseRnd = MIN_SCALE + Math.random() * (MAX_SCALE - MIN_SCALE);
        // le aplicamos el catScale que pasaste a initSection
        const scale = baseRnd * catScale;

        return {
          x: marginX + Math.random() * (canvas.width - 2 * marginX),
          y: marginY + Math.random() * (canvas.height - 2 * marginY),
          scale,
          proyecto: p,
        };
      });
    }

    function dibujaNubes(semillas) {
      scope.project.activeLayer.removeChildren();
      const paths = semillas.map((s) => {
        const path = new scope.Path();
        const w = BASE_SIZE * s.scale;
        const h = w * (10 / 16);
        nubeCoords.forEach(([px, py], i) => {
          const x = s.x + (px - 0.5) * w;
          const y = s.y + (py - 0.5) * h;
          i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
        });
        path.closed = true;
        const st = getComputedStyle(document.documentElement);
        path.fillColor = st.getPropertyValue("--color-2").trim() || "#fff";
        path.strokeColor = st.getPropertyValue("--color-3").trim() || "#000";
        path.strokeWidth = 6;
        return path;
      });
      // fusionar
      for (let i = 0; i < paths.length; i++) {
        for (let j = i + 1; j < paths.length; j++) {
          if (paths[i] && paths[i].bounds.intersects(paths[j].bounds)) {
            paths[i] = paths[i].unite(paths[j]);
            paths[j].remove();
          }
        }
      }
      scope.view.update();
    }

    function pintaLabels(semillas) {
      container.innerHTML = "";
      semillas.forEach((s) => {
        const d = document.createElement("div");
        d.className = "label";
        d.style.cssText = "position:absolute;pointer-events:auto;";
        d.style.left = `${s.x}px`;
        d.style.top = `${s.y}px`;
        if (s.proyecto.links?.length) {
          const a = document.createElement("a");
          a.href = s.proyecto.links[0].url;
          a.target = "_blank";
          a.textContent = s.proyecto.title;
          d.appendChild(a);
        } else {
          d.textContent = s.proyecto.title;
        }
        container.appendChild(d);
      });
    }

    function renderSection() {
      const semillas = generaSemillas();
      dibujaNubes(semillas);
      pintaLabels(semillas);
    }

    renderSection();
    return renderSection;
  }

  // 5) Inicializo todas las secciones
  proyectos.forEach((cat, idx) => {
    // 1) comprobamos visibilidad/escala
    const catSettings = visMap.get(cat.category) || { visible: true, scale: 1 };
    if (!catSettings.visible) return; // saltamos si está oculto

    // 2) creamos sección, canvas y container
    const slug = cat.category
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const section = document.createElement("section");
    section.className = `category-section category-${slug}`;
    section.dataset.index = idx;
    section.style.cssText = "position:relative;width:100%;height:100vh;";

    const canvas = document.createElement("canvas");
    canvas.className = "canvas-nubes";
    Object.assign(canvas.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    });
    section.appendChild(canvas);

    const container = document.createElement("div");
    container.className = "container--content";
    Object.assign(container.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    });
    section.appendChild(container);

    // 3) lo insertamos en el DOM
    app.appendChild(section);

    // 4) e inicializamos Paper.js pasando la escala
    initSection(section, cat.projects, catSettings.scale);
  });

  // 6) Theme‐switcher y botones (igual que antes)
  initThemeSwitcher();
});
