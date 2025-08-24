function applyPalette(paletteName) {
    // Iterar sobre los colores de la paleta y aplicarlos a las variables principales
    for (let i = 1; i <= 4; i++) {
      const paletteVariable = `--${paletteName}-color-${i}`;
      const mainVariable = `--color-${i}`;
      const colorValue = getComputedStyle(document.documentElement).getPropertyValue(paletteVariable).trim();
      document.documentElement.style.setProperty(mainVariable, colorValue);
    }
  }