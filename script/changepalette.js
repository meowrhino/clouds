function applyPalette(paletteName) {
  // Iterar sobre los colores de la paleta y aplicarlos a las variables principales
  for (let i = 1; i <= 4; i++) {
    const paletteVariable = `--${paletteName}-color-${i}`;
    const mainVariable = `--color-${i}`;
    const colorValue = getComputedStyle(document.documentElement)
      .getPropertyValue(paletteVariable)
      .trim();
    document.documentElement.style.setProperty(mainVariable, colorValue);
  }
}

// === Palette pickers (sync + live update; no popup toggle here) ===
(function(){
  function cssHexFrom(value){
    if (!value) return "#000000";
    value = String(value).trim();
    if (value.startsWith("#")){
      if (value.length === 4){ return "#" + value[1]+value[1] + value[2]+value[2] + value[3]+value[3]; }
      return value;
    }
    const m = value.match(/rgba?\(([^)]+)\)/i);
    if (m){
      const parts = m[1].split(",").map(s=>s.trim());
      const r = parseInt(parts[0],10) || 0;
      const g = parseInt(parts[1],10) || 0;
      const b = parseInt(parts[2],10) || 0;
      const toHex = (n)=>("0"+n.toString(16)).slice(-2);
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    return "#000000";
  }

  function syncPickers(){
    const root = document.documentElement;
    document.querySelectorAll('input.color-picker').forEach(inp => {
      const varName = inp.getAttribute('data-color-var');
      if (!varName) return;
      const computed = getComputedStyle(root).getPropertyValue(varName).trim();
      const hex = cssHexFrom(computed);
      try { inp.value = hex; } catch(e){}
    });
  }

  function onPickerInput(e){
    const inp = e.currentTarget;
    const varName = inp.getAttribute('data-color-var');
    if (!varName) return;
    const value = inp.value;
    document.documentElement.style.setProperty(varName, value);
    document.dispatchEvent(new CustomEvent('palette:colorChanged', { detail:{ varName, value }}));
  }

  function setupPickers(){
    document.querySelectorAll('input.color-picker').forEach(inp => {
      inp.removeEventListener('input', onPickerInput);
      inp.addEventListener('input', onPickerInput);
    });
    syncPickers();
  }

  // Observe popup open/close to re-sync when it opens
  function observePopup(){
    const popup = document.getElementById('palette-popup');
    if (!popup) return;
    const obs = new MutationObserver(() => {
      if (popup.classList.contains('active')) {
        requestAnimationFrame(syncPickers);
      }
    });
    obs.observe(popup, { attributes:true, attributeFilter:['class'] });
  }

  // Hook palette buttons: after applyPalette, sync
  const _applyPalette = window.applyPalette;
  window.applyPalette = function(name){
    _applyPalette && _applyPalette(name);
    requestAnimationFrame(syncPickers);
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupPickers();
    observePopup();
    // If user clicks the trigger, just sync (do NOT toggle here)
    const trig = document.getElementById('open-fun');
    if (trig){
      trig.addEventListener('click', ()=> requestAnimationFrame(syncPickers));
    }
  });
})();
