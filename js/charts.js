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

document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndDisplaySongs();
});

async function fetchAndDisplaySongs() {
    try {
        const response = await fetch("/api/music");
        if (!response.ok) throw new Error("Failed to fetch music data");

        let musicData = await response.json();
        const element = document.querySelector("[class*='most-']"); 

        if (element) {
            // Get the full class name for the respective section
            const classList = Array.from(element.classList);
            const targetClass = classList.find(cls => cls.startsWith("most-"));

            if (targetClass) {
                const key = targetClass.replace("most-", ""); // Remove "most-" prefix

                switch (key) {
                    case "popular":
                        // Sorting by listen count
                        musicData.sort((a, b) => b.listen_count - a.listen_count);
                        updatePopular(musicData);
                        console.log("Accessed popular charts.");
                        break;
                    case "critical":
                        musicData.sort((a, b) => b.dislike_count - a.dislike_count);
                        updateCritical(musicData);
                        console.log("Accessed critical charts");
                        break;
                    case "based":
                        updateBased(musicData);
                        console.log("Accessed based charts");
                        break;
                    default:
                        console.log("Unknown section.");
                }
            }
        }

    } catch (error) {
        console.error("Error loading music data:", error);
    }
}

function updatePopular(musicData) {
    // Select or create the `.popular-grid` container
    let gridContainer = document.querySelector(".popular-grid");
    if (!gridContainer) {
        gridContainer = document.createElement("div");
        gridContainer.classList.add("popular-grid");
        document.querySelector(".most-popular").appendChild(gridContainer);
    }

    // Clear only previous items but keep the grid container
    gridContainer.innerHTML = "";

    // Populate with songs
    musicData.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.classList.add("popular-item");
        songElement.innerHTML = `
            <img src="${song.image}" alt="Image">
            <h2>${index + 1}. ${song.name}</h2>
            <p>${song.artists.join(", ")}</p>
            <button>See More</button>
        `;
        gridContainer.appendChild(songElement);

        const button = songElement.querySelector("button");
        button.addEventListener("click", () => {
            let songID = song._id || song.id;
            console.log("Redirecting to:", `/review/${songID}`);
            window.location.href = `/review/${songID}`;
        });
    });
}

function updateCritical(musicData) {
    let gridContainer = document.querySelector(".critical-grid");
    if (!gridContainer) {
        gridContainer = document.createElement("div");
        gridContainer.classList.add("critical-grid");
        document.querySelector(".most-critical").appendChild(gridContainer);
    }

    gridContainer.innerHTML = "";

    musicData.forEach((song, index) => {
        let songElement = document.createElement("div");
        songElement.classList.add("critical-item");
        songElement.innerHTML = `
            <img src="${song.image}" alt="Image">
            <h2>${index + 1}. ${song.name}</h2>
            <p>${song.artists.join(", ")}</p>
            <button>See More</button>
        `;
        gridContainer.appendChild(songElement);

        let button = songElement.querySelector("button");
        button.addEventListener("click", () => {
            let songID = song._id || song.id;
            console.log("Redirecting to:", `/review/${songID}`);
            window.location.href = `/review/${songID}`;
        });
    });
}

function updateBased(musicData) {
    // Sorting by (weighted) 60% listen count, 40% like count
    const totalListens = musicData.reduce((sum, song) => sum + song.listen_count, 0) || 1; // Prevent division by zero
    const totalLikes = musicData.reduce((sum, song) => sum + song.like_count, 0) || 1;

    // Compute weighted scores for each song
    const updatedMusicData = musicData.map(song => {
        const listenWeight = song.listen_count / totalListens;
        const likeWeight = song.like_count / totalLikes;

        return {
            ...song,
            score: (listenWeight * 0.6) + (likeWeight * 0.4)
        };
    });

    updatedMusicData.sort((a, b) => b.score - a.score);

    console.log("Sorted music data:", updatedMusicData);

    let gridContainer = document.querySelector(".based-grid");
    if (!gridContainer) {
        gridContainer = document.createElement("div");
        gridContainer.classList.add("based-grid");
        document.querySelector(".most-based").appendChild(gridContainer);
    }

    gridContainer.innerHTML = "";

    updatedMusicData.forEach((song, index) => {
        let songElement = document.createElement("div");
        songElement.classList.add("based-item");
        songElement.innerHTML = `
            <img src="${song.image}" alt="Image">
            <h2>${index + 1}. ${song.name}</h2>
            <p>${song.artists.join(", ")}</p>
            <button>See More</button>
        `;
        gridContainer.appendChild(songElement);

        let button = songElement.querySelector("button");
        button.addEventListener("click", () => {
            let songID = song._id;
            console.log("Redirecting to:", `/review/${songID}`);
            window.location.href = `/review/${songID}`;
        });
    });
}

