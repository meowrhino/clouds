function getRandomPosition(containerWidth, containerHeight, elementWidth, elementHeight) {
    const x = Math.floor(Math.random() * (containerWidth - elementWidth));
    const y = Math.floor(Math.random() * (containerHeight - elementHeight));
    return { x, y };
}

function noSolapa(rect, otrosRects) {
    return !otrosRects.some(r =>
        !(rect.right < r.left || rect.left > r.right || rect.bottom < r.top || rect.top > r.bottom)
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container--content');
    const elements = container.querySelectorAll('.pre-box');
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const colocados = [];

    elements.forEach(element => {
        let intentos = 0;
        let colocado = false;

        while (intentos < 100 && !colocado) {
            const { x, y } = getRandomPosition(containerWidth, containerHeight, element.offsetWidth, element.offsetHeight);
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            const rect = element.getBoundingClientRect();

            if (noSolapa(rect, colocados)) {
                colocados.push(rect);
                colocado = true;
            }

            intentos++;
        }

        // Si no se pudo colocar sin solaparse, se queda en el último intento.
    });
});