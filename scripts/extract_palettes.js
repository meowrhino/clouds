/**
 * Node script para leer styles.css, extraer variables
 * --<tema>-color-1…4 y agruparlas en un JSON.
 *
 * Uso:
 *   node extract_palettes.js > palettes.json
 */

const fs = require('fs');
const path = require('path');

// 1) Leemos el CSS
const cssPath = path.resolve(__dirname, 'styles.css');
const css    = fs.readFileSync(cssPath, 'utf8');

// 2) Regex para variables --<tema>-color-<n>: <hex>;
const varRegex = /--([a-zA-Z0-9_-]+)-color-([1-4])\s*:\s*(#[0-9A-Fa-f]{6})/g;

// 3) Agrupamos en un objeto { tema: [c1,c2,c3,c4], ... }
const palettes = {};
let m;
while ((m = varRegex.exec(css)) !== null) {
  const tema  = m[1];  // e.g. "original", "burnt", "archive"…
  const idx   = parseInt(m[2], 10) - 1; // 0-based
  const color = m[3];

  if (!palettes[tema]) palettes[tema] = [];
  palettes[tema][idx] = color;
}

// 4) Salida formateada
console.log(JSON.stringify(palettes, null, 2));