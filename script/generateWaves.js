function generateWaves() {
    const waveContainer = document.getElementById('wave-container');
    const waveSymbols = ['~', '~~', '~~~', '~~~~'];
    const isMobile = window.innerWidth <= 768; 
    const waveLinesCount = Math.ceil(window.innerHeight / (isMobile ? 80 : 30)); 

    // Limpiar el contenedor de olas
    waveContainer.innerHTML = '';

    // Generar nuevas olas
    for (let i = 0; i < waveLinesCount; i++) {
        const waveLine = document.createElement('div');
        waveLine.className = 'wave-line';
        waveLine.style.top = `${Math.random() * window.innerHeight}px`;
        waveLine.style.left = `${Math.random() * window.innerWidth}px`;

        // Crear un patrón aleatorio de olas
        const waveLength = Math.floor(Math.random() * (isMobile ? 7 : 10)) + (isMobile ? 3 : 5);
        waveLine.textContent = Array.from({ length: waveLength }, () => 
            Math.random() > 0.7 ? '    ' : waveSymbols[Math.floor(Math.random() * waveSymbols.length)]
        ).join(' ');

        waveContainer.appendChild(waveLine);
    }
}

// Generar las olas iniciales y regenerarlas cada 5 segundos
window.onload = () => {
    generateWaves();
    setInterval(generateWaves, 1250);
};

// Regenerar las olas al redimensionar la ventana
window.onresize = generateWaves;
