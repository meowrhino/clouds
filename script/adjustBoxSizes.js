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



// === Robust event wiring (debounced & font-safe) ===
function _debounce(fn, ms=80){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,a), ms); }; }
const _onResize = _debounce(adjustBoxSizes, 80);

window.addEventListener('load', adjustBoxSizes);
window.addEventListener('resize', _onResize);
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(adjustBoxSizes); }

// Open / Close popup
document.addEventListener('click', (e)=>{
  const open = e.target.closest('.popup-trigger');
  const close = e.target.closest('.close-popup');
  if (open){ document.querySelector('.popup')?.classList.add('active'); requestAnimationFrame(adjustBoxSizes); }
  if (close){ document.querySelector('.popup')?.classList.remove('active'); }
});

// Keep sizes fresh on layout changes
try {
  const ro = new ResizeObserver(_onResize);
  ro.observe(document.body);
} catch(e){ /* optional */ }


// Toggle popup with the same button; update label
(function(){
  const trigger = document.getElementById('open-fun');
  const label = trigger?.querySelector('h4');
  function setState(open){
    document.querySelector('.popup')?.classList.toggle('active', open);
    trigger?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.textContent = open ? 'close fun' : 'open fun';
    if (open) { requestAnimationFrame(adjustBoxSizes); }
  }
  trigger?.addEventListener('click', (e)=>{
    e.preventDefault();
    const isOpen = document.querySelector('.popup')?.classList.contains('active');
    setState(!isOpen);
  });
  document.addEventListener('click', (e)=>{
    if (e.target.closest('.close-popup')) setState(false);
  });
  // close on Escape
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') setState(false); });
})();
