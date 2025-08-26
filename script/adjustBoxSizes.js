function adjustBoxSizes() {
    const boxes = document.querySelectorAll('.box:not(.popup .box)');
    const preboxes = document.querySelectorAll('.pre-box:not(.popup .pre-box)');
    const popupBoxes = document.querySelectorAll('.popup .box');
    const popupPreboxes = document.querySelectorAll('.popup .pre-box');
    const aspectRatio = 1.55;

    // Regular boxes
    boxes.forEach(box => {
        const width = box.offsetWidth;
        const height = width / aspectRatio;
        box.style.height = `${height}px`;
    });

    preboxes.forEach(prebox => {
        const width = prebox.offsetWidth;
        const height = width / aspectRatio;
        prebox.style.height = `${height}px`;
    });

    // Popup boxes - using the same aspect ratio
    if (document.querySelector('.popup.active')) {
        popupBoxes.forEach(box => {
            const width = box.offsetWidth;
            const height = width / aspectRatio;
            box.style.height = `${height}px`;
        });

        popupPreboxes.forEach(prebox => {
            const width = prebox.offsetWidth;
            const height = width / aspectRatio;
            prebox.style.height = `${height}px`;
        });
    }
}





// Toggle popup with the same button; update label
// === Minimal robust listeners (debounced & font-safe) ===
function _debounce(fn, ms=80){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,a), ms); }; }
const _onResize = _debounce(adjustBoxSizes, 80);
window.addEventListener('load', adjustBoxSizes);
window.addEventListener('resize', _onResize);
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(adjustBoxSizes); }
try { new ResizeObserver(_onResize).observe(document.body); } catch(e){}


// Toggle popup with the same "open fun" button; label swaps to 'close fun'
(function(){
  const trigger = document.getElementById('open-fun');
  const label = trigger?.querySelector('h4');
  function setState(open){
    const popup = document.querySelector('.popup');
    if (!popup) return;
    popup.classList.toggle('active', open);
    trigger?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.textContent = open ? 'close fun' : 'open fun';
    if (open) { requestAnimationFrame(adjustBoxSizes); }
  }
  trigger?.addEventListener('click', (e)=>{
    e.preventDefault();
    const popup = document.querySelector('.popup');
    const isOpen = popup?.classList.contains('active');
    setState(!isOpen);
  });
  // close on Escape
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') setState(false); });
})();