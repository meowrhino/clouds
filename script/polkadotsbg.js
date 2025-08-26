
(function(){
  function docHeight(){
    const d = document;
    return Math.max(
      d.body.scrollHeight, d.documentElement.scrollHeight,
      d.body.offsetHeight, d.documentElement.offsetHeight,
      d.documentElement.clientHeight
    );
  }
  function generateDots() {
    const waveContainer = document.getElementById('dot-container');
    if (!waveContainer) return;
    const area = window.innerWidth * docHeight();
    const totalDots = Math.min(15000, Math.floor(area / 12000)); // density ~1 dot per 12k px²
    waveContainer.innerHTML = '';
    const H = docHeight();
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'point';
      dot.textContent = '.';
      dot.style.left = Math.random() * window.innerWidth + 'px';
      dot.style.top  = Math.random() * H + 'px';
      waveContainer.appendChild(dot);
    }
  }
  const regen = () => { requestAnimationFrame(generateDots); };
  window.addEventListener('load', regen);
  window.addEventListener('resize', regen);
  window.addEventListener('clouds:rendered', regen);
  setInterval(regen, 1500); // gentle refresh in case of dynamic changes
})();
