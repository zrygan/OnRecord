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
                        // Sorting by descending listen count
                        musicData.sort((a, b) => b.listen_count - a.listen_count);
                        updatePopular(musicData);
                        console.log("Accessed popular charts.");
                        break;
                    case "critical":
                        // Ascending listen count
                        musicData.sort((a, b) => a.listen_count - b.listen_count);
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
    // Calculate total listens and total likes
    const totalListens = musicData.reduce((sum, song) => sum + song.listen_count, 0) || 1; // Prevent division by zero
    const totalLikes = musicData.reduce((sum, song) => sum + song.likes.length, 0);

    // Compute weighted scores for each song
    const updatedMusicData = musicData.map(song => {
        const listenWeight = song.listen_count / totalListens;
        const likeWeight = totalLikes > 0 ? song.likes.length / totalLikes : 0; // If no likes exist, set likeWeight to 0

        return {
            ...song,
            score: (listenWeight * 0.6) + (likeWeight * 0.4)
        };
    });

    // Sort in descending order (higher score first)
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

// Search Function
document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    let hideResultsTimeout;
  
    if (!searchInput || !searchResults) {
      console.error("Search elements not found!");
      return;
    }
  
    // Show search results container when user starts typing
    searchInput.addEventListener("input", async function () {
      const query = searchInput.value.trim();
  
      // Clear results and hide container if query is empty
      if (query.length === 0) {
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
        return;
      }
  
      try {
        const response = await fetch(
          `/search?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displaySearchResults(data);
  
        // Make sure results are visible whenever we have results
        if (data.length > 0) {
          searchResults.style.display = "block";
        } else {
          searchResults.style.display = "none";
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    });
  
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission if in a form
  
        // If there are search results and the first one is visible, navigate to it
        const firstResult = searchResults.querySelector(".search-result-item");
        if (firstResult) {
          firstResult.click();
        }
      }
    });
  
    searchInput.addEventListener("focus", function () {
      if (searchInput.value.trim().length > 0) {
        searchResults.style.display = "block";
      }
    });
  
    searchResults.addEventListener("mouseenter", function () {
      clearTimeout(hideResultsTimeout);
    });
  
    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = "none";
      }
    });
  
    function displaySearchResults(results) {
      searchResults.innerHTML = "";
  
      if (results.length === 0) {
        searchResults.style.display = "none";
        return;
      }
  
      searchResults.style.display = "block";
  
      results.forEach((result) => {
        let resultItem = document.createElement("div");
        resultItem.classList.add("search-result-item");
  
        if (result.type === "user") {
          resultItem.innerHTML = `<span style="color: grey;">user: </span><span style="color: var(--darkBlue);">${result.username}</span>`;
        } else if (result.type === "music") {
          resultItem.innerHTML = `<span style="color: grey;">song: </span><span style="color: var(--darkBlue);">${result.name}</span>`;
        } else if (result.type === "albumSong") {
          resultItem.innerHTML = `<span style="color: grey;">song: </span><span style="color: var(--darkBlue);">${result.name} (in ${result.album})</span>`;
        } else if (result.type === "artist") {
          resultItem.innerHTML = `<span style="color: var(--orange);">artist: </span><span style="color: var(--darkBlue);">${result.username}</span>`;
        }
  
        resultItem.addEventListener("click", function () {
          // For both "music" and "albumSong" we route to the review page.
          if (result.type === "user" || result.type === "artist") {
            window.location.href = `/user/${result.username}`;
          } else if (result.type === "albumSong" || result.type === "music") {
            window.location.href = `/review/${result.id}`;
          }
        });
  
        searchResults.appendChild(resultItem);
      });
    }
});