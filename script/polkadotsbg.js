function generateDots() {
    const totalDots = Math.floor((window.innerWidth * window.innerHeight) / 15000); // Cantidad de puntos basada en el tamaño de la ventana
    const waveContainer = document.getElementById('dot-container')
    waveContainer.innerHTML = ''; // Limpia cualquier contenido previo

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'point';
      dot.textContent = '.'; // Puedes cambiar este carácter si lo prefieres
      dot.style.left = `${Math.random() * window.innerWidth}px`; // Posición horizontal aleatoria
      dot.style.top = `${Math.random() * window.innerHeight*5}px`; // Posición vertical aleatoria
      waveContainer.appendChild(dot);
    }
  }

  // Genera los puntos al cargar y al redimensionar la ventana
  window.onload = generateDots;
  window.onresize = generateDots;
  setInterval(generateDots, 200);