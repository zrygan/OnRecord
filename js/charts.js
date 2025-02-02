document.addEventListener("DOMContentLoaded", function () {
    const background = document.querySelector(".background");

    function createSquares() {
        background.innerHTML = "";

        const squareSize = 100;
        const cols = Math.ceil(window.innerWidth / squareSize) + 2;
        const rows = Math.ceil(window.innerHeight / squareSize) + 2;

        background.style.width = `${cols * squareSize}px`;
        background.style.height = `${rows * squareSize}px`;

        for (let i = 0; i < cols * rows; i++) {
            let square = document.createElement("div");
            square.classList.add("square");
            background.appendChild(square);
        }
    }

    createSquares();
    window.addEventListener("resize", createSquares);
});


