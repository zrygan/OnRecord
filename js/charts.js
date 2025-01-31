document.addEventListener("DOMContentLoaded", function () {
    const background = document.querySelector(".background");

    function createSquares() {
        background.innerHTML = "";

        const squareSize = 100;
        
        const cols = Math.ceil(window.innerWidth / squareSize);
        const rows = Math.ceil(window.innerHeight / squareSize);
        const totalSquares = cols * rows;

        for (let i = 0; i < totalSquares; i++) {
            let square = document.createElement("div");
            square.classList.add("square");
            background.appendChild(square);
        }
    }

    createSquares(); // Initial load
    window.addEventListener("resize", createSquares); // Recalculate on resize
});

