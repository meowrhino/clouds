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

// Add event listeners
window.onload = adjustBoxSizes;
window.onresize = adjustBoxSizes;
document.querySelector('.popup-trigger').addEventListener('click', () => {
    document.querySelector('.popup').classList.add('active');
    setTimeout(adjustBoxSizes, 0); // Run after display change
});