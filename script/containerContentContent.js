// script/containerContentContent.js
  const container = document.querySelector('.container--content');

    // Factor aleatorio
    function getRandomFactor() {
      const isMobile = window.matchMedia("(max-width: 600px)").matches;
      if (isMobile) {
          return 0.65 + Math.random() * 1.0;
      }
      return 0.85 + Math.random() * 1.2;
    }

  function getRomanIndex(num) {
    switch (num) {
      case 1: return "i";
      case 2: return "ii";
      case 3: return "iii";
      case 4: return "iv";
      case 5: return "v";
      default: return num;
    }
  }

  function createElement(item) {
    const preBox = document.createElement('div');
    preBox.classList.add('pre-box');

    const box = document.createElement('div');
    box.classList.add('box', 'box--title');

      // 1) Comprobamos si hay varios enlaces o solo uno
      const linksArray = item.links || [];
      if (linksArray.length <= 1) {
          // ---- SOLO UN ENLACE ----
          const h5 = document.createElement('h5');
          const linkElement = document.createElement('a');
          linkElement.href = linksArray[0] || "#";
          linkElement.textContent = item.name;
          linkElement.target = "_blank";
          h5.appendChild(linkElement);
          box.appendChild(h5);

      } else {
          // ---- VARIOS ENLACES ----
          // Creamos el h4 con el nombre
          const h4 = document.createElement('h4');
          box.classList.add('flex-column');
          
          h4.textContent = item.name;
          box.appendChild(h4);
          

          // Debajo, un <p> con spans para cada enlace
          const p = document.createElement('p');
          linksArray.forEach((link, index) => {
              const span = document.createElement('span');
              const a = document.createElement('a');
              a.target = "_blank";
              a.href = link;
              // index comienza en 0, así que para getRomanIndex lo pasamos como (index+1)
              a.textContent = getRomanIndex(index + 1);
              span.appendChild(a);
              p.appendChild(span);
          });
          box.appendChild(p);
      }

      // Ajustes de estilo y dimensiones
      box.style.height = 'inherit';
      box.style.width = 'inherit';
      preBox.appendChild(box);

      // Aplicar un tamaño aleatorio
      const randomFactor = getRandomFactor();
      const baseWidth = 200;
      const newWidth = baseWidth * randomFactor;
      const newHeight = newWidth / 1.55;
      preBox.style.width = `${newWidth}px`;
      preBox.style.height = `${newHeight}px`;

      container.appendChild(preBox);
    }

// Generar elementos dinámicamente desde el JSON en GitHub Pages
fetch("proyectos.json")
  .then(res => res.json())
  .then(items => {
    items.forEach(item => createElement(item));
    updateElements();
    detectZoomOrScroll();
  })
  .catch(err => console.error("Error cargando proyectos:", err));

    // Recalcula tamaños y posiciones
    function updateElements() {
      const elements = container.querySelectorAll('.pre-box');
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      elements.forEach(element => {
        // Tamaño aleatorio
        const randomFactor = getRandomFactor();
        const baseWidth = 200;
        const newWidth = baseWidth * randomFactor;
        const newHeight = newWidth / 1.55;
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;

        // Posición aleatoria
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;
        const x = Math.floor(Math.random() * (containerWidth - elementWidth));
        const y = Math.floor(Math.random() * (containerHeight - elementHeight));
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.position = 'absolute';
      });
    }

  function throttle(func, limit) {
    let inThrottle;
    return function () {
      if (!inThrottle) {
        func.apply(this, arguments);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  function detectZoomOrScroll() {
    let lastZoom = window.devicePixelRatio;
    let lastContainerWidth = container.offsetWidth;
    let lastContainerHeight = container.offsetHeight;

      // Detectar zoom
      setInterval(() => {
        if (window.devicePixelRatio !== lastZoom) {
          lastZoom = window.devicePixelRatio;
          // Actualizar solo si cambian las dimensiones del contenedor
          if (
            container.offsetWidth !== lastContainerWidth ||
            container.offsetHeight !== lastContainerHeight
          ) {
            lastContainerWidth = container.offsetWidth;
            lastContainerHeight = container.offsetHeight;
            updateElements();
          }
        }
      }, 200);

      // Detectar scroll (solo posiciones con throttle)
     /* window.addEventListener('scroll', throttle(updatePositions, 200));*/
    }

    // Limitar frecuencia de ejecución
    function throttle(func, limit) {
      let inThrottle;
      return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }

    // Eventos
    window.addEventListener('resize', throttle(updateElements, 200));

    document.addEventListener('DOMContentLoaded', () => {
      updateElements();  // Ajusta tamaños y posiciones al cargar
      detectZoomOrScroll();
    });

/*
// Aplicar posiciones y tamaños iniciales al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    items.forEach(item => {
        createElement(item.name, item.link);
    });
    updateElements(); // Aplicar posiciones y tamaños inicialmente
    detectZoomOrScroll(); // Detectar zoom o scroll
});
*/

/*
// Detectar zoom o scroll y activar updateElements
function detectZoomOrScroll() {
    let lastZoom = window.devicePixelRatio;

    // Detectar cambios de zoom
    setInterval(() => {
        if (window.devicePixelRatio !== lastZoom) {
            lastZoom = window.devicePixelRatio;
            updateElements();
        }
    }, 100);

    // Detectar scroll
    window.addEventListener('scroll', updateElements);
}

// Aplicar posiciones y tamaños iniciales al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    items.forEach(item => {
        createElement(item.name, item.link);
    });
    updateElements(); // Aplicar posiciones y tamaños inicialmente
    detectZoomOrScroll(); // Detectar zoom o scroll
});
*/

/*
cosas traviesas:
// Función para que el elemento cambie de posición al intentar atraparlo
function addEscapeBehavior() {
    const elements = container.querySelectorAll('.pre-box');
    elements.forEach(element => {
        element.addEventListener('mouseover', () => {
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;

            const x = Math.floor(Math.random() * (containerWidth - elementWidth));
            const y = Math.floor(Math.random() * (containerHeight - elementHeight));

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        });
    });
}
    */
