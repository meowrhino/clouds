// themeSwitcher.js

// ——————————————
// Referencias DOM
// ——————————————
const selTheme   = document.getElementById('theme-select');
const divPickers = document.getElementById('color-pickers');
const btnApply   = document.getElementById('apply-theme');
const btnOpen    = document.getElementById('open-fun');
const panelTheme = document.getElementById('theme-panel');

// ——————————————
// Debounce de resize para recargar render
// ——————————————
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Si quieres recargar página entera:
    // window.location.reload();
    // O simplemente re-renderizar:
    if (typeof render === 'function') render();
  }, 300);
});

// ——————————————
// Theme switcher: lista de paletas en palettes.css
// ——————————————
function initThemeSwitcher() {
  // 1) Localiza la hoja que contiene tus paletas
  const paletteSheet = Array.from(document.styleSheets)
    .find(sheet => sheet.href && sheet.href.includes('palettes.css'));

  if (!paletteSheet) {
    console.error('No encuentro palettes.css');
    return;
  }

  // 2) Intenta leer sus reglas (evita CORS con try/catch)
  let rules;
  try {
    rules = paletteSheet.cssRules;
  } catch (e) {
    console.error('No puedo leer cssRules de palettes.css', e);
    return;
  }

  // 3) Busca la regla :root y extrae prefijos de tema
  const temas = [];
  for (const rule of rules) {
    if (rule.selectorText === ':root') {
      for (const name of rule.style) {
        // detecta sólo "xxx-color-1"
        if (name.endsWith('-color-1')) {
          // quita "-color-1", queda e.g. "burnt", "monochrome", etc.
          temas.push(name.replace('-color-1', ''));
        }
      }
      break;
    }
  }

  // 4) Limpia y rellena el <select> con cada tema
  selTheme.innerHTML = '<option value="" disabled selected>Selecciona tema</option>';
  temas.forEach(prefijo => {
    const option = document.createElement('option');
    option.value       = prefijo;   // ej. "burnt"
    option.textContent = prefijo;   // ej. "burnt"
    selTheme.appendChild(option);
  });

  // 5) Al cambiar selección, crea los 4 pickers desde las vars CSS
  selTheme.addEventListener('change', () => {
    const tema = selTheme.value;
    if (!tema) return;           // evita ejecución con valor vacío

    divPickers.innerHTML = '';
    [1,2,3,4].forEach(i => {
      const varName = `--${tema}-color-${i}`;  // ej. "--burnt-color-1"
      let current = getComputedStyle(document.documentElement)
                        .getPropertyValue(varName).trim();
      // fallback si no es "#rrggbb"
      if (!/^#[0-9A-Fa-f]{6}$/.test(current)) {
        current = '#ffffff';
      }
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label>${varName}</label>
        <input
          type="color"
          data-var="--color-${i}"
          value="${current}"
        />
      `;
      divPickers.appendChild(wrap);
    });
  });

  // 6) Al hacer click en "Aplicar", reasigna tus variables --color-1..4
  btnApply.addEventListener('click', () => {
    divPickers.querySelectorAll('input[type=color]').forEach(input => {
      const targetVar = input.dataset.var;  // "--color-1", etc.
      document.documentElement.style
              .setProperty(targetVar, input.value);
    });
    // refresca nubes con nuevos colores
    if (typeof render === 'function') render();
  });

  // 7) Toggle del panel con el botón
  btnOpen.addEventListener('click', () => {
    panelTheme.classList.toggle('hidden');
    if (!panelTheme.classList.contains('hidden')) {
      // dispara change para cargar pickers de inmediato
      selTheme.dispatchEvent(new Event('change'));
    }
  });
}

// ——————————————
// Inicializa el switcher al cargar el script
// ——————————————
document.addEventListener('DOMContentLoaded', initThemeSwitcher);