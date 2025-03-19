async function getCurrentUsername() {
  try {
    const response = await fetch("/api/current-username");
    if (!response.ok) {
      throw new Error("Failed to fetch current username");
    }
    const data = await response.json();
    return data.username;
  } catch (error) {
    console.error("Error fetching current username:", error);
    return null;
  }
}

async function getSongLikes(songId) {
  try {
    const response = await fetch(`/api/songs/${songId}/likes`);
    if (!response.ok) {
      throw new Error("Failed to fetch song likes");
    }
    const data = await response.json();
    return data.likes;
  } catch (error) {
    console.error("Error fetching song likes:", error);
    return [];
  }
}

async function likeSong(songId, username) {
  try {
    const response = await fetch(`/api/songs/${songId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      throw new Error("Failed to like song");
    }
    const data = await response.json();
    return data.likes;
  } catch (error) {
    console.error("Error liking song:", error);
    return [];
  }
}

async function unlikeSong(songId, username) {
  try {
    const response = await fetch(`/api/songs/${songId}/unlike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      throw new Error("Failed to unlike song");
    }
    const data = await response.json();
    return data.likes;
  } catch (error) {
    console.error("Error unliking song:", error);
    return [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getCurrentUsername(); // Fetch the current user's username
    const username = user.username;
    if (!username) {
      throw new Error("Username not found");
    }

    const songBoxes = document.querySelectorAll(".song-box");
    const promises = Array.from(songBoxes).map(async (songBox) => {
      const songId = songBox.getAttribute("data-id");
      if (!songId) {
        console.error("Song ID not found for song box:", songBox);
        return;
      }

      const likes = await getSongLikes(songId);

      const heart = songBox.querySelector(".song-heart");
      if (likes.includes(username)) {
        heart.src = "../svg/home/heart-select-pink.svg";
      } else {
        heart.src = "../svg/home/heart-select-gray.svg";
      }

      const heartNumber = songBox.querySelector(".song-heart-number");
      heartNumber.textContent = likes.length;

      songBox
        .querySelector(".song-heart-select")
        .addEventListener("click", async (event) => {
          const heart = event.currentTarget.querySelector(".song-heart");
          if (heart.src.includes("heart-select-gray.svg")) {
            heart.src = "../svg/home/heart-select-pink.svg";
            const newLikes = await likeSong(songId, username);
            heartNumber.textContent = newLikes.length;
          } else {
            heart.src = "../svg/home/heart-select-gray.svg";
            const newLikes = await unlikeSong(songId, username);
            heartNumber.textContent = newLikes.length;
          }
        });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error processing songs:", error);
  }

  // PART 2: SEARCH FUNCTIONALITY
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
          window.location.href = `/user/${result.id}`;
        } else if (result.type === "albumSong" || result.type === "music") {
          window.location.href = `/review/${result.id}`;
        }
      });

      searchResults.appendChild(resultItem);
    });
  }
}); 