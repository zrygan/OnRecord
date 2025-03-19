document.addEventListener("DOMContentLoaded", async () => {
  // PART 1: Song interaction functionality
  try {
    const username = await getCurrentUsername(); // Fetch the current user's username
    if (!username) {
      throw new Error("Username not found");
    }
    console.log("Current username:", username);

    const songBoxes = document.querySelectorAll(".song-box");
    const promises = Array.from(songBoxes).map(async (songBox) => {
      const songId = songBox.getAttribute("data-id");
      if (!songId) {
        console.error("Song ID not found for song box:", songBox);
        return;
      }
      console.log("Processing song with ID:", songId);

      const likes = await getSongLikes(songId);
      console.log("Likes for song", songId, ":", likes);

      if (likes.includes(username)) {
        const heart = songBox.querySelector(".song-heart");
        heart.src = "../svg/home/heart-select-pink.svg";
        console.log("Set heart to pink for song", songId);
      }

      const heartNumber = songBox.querySelector(".song-heart-number");
      heartNumber.textContent = likes.length;

      const reviews = await getSongReviews(songId);
      console.log("Reviews for song", songId, ":", reviews);

      const reviewNumber = songBox.querySelector(".song-review-number");
      reviewNumber.textContent = reviews.length;

      songBox
        .querySelector(".song-heart-select")
        .addEventListener("click", async (event) => {
          const heart = event.currentTarget.querySelector(".song-heart");
          if (heart.src.includes("heart-select-gray.svg")) {
            heart.src = "../svg/home/heart-select-pink.svg";
            console.log("Liking song", songId);
            const newLikes = await likeSong(songId, username);
            heartNumber.textContent = newLikes.length;
          } else {
            heart.src = "../svg/home/heart-select-gray.svg";
            console.log("Unliking song", songId);
            const newLikes = await unlikeSong(songId, username);
            heartNumber.textContent = newLikes.length;
          }
        });
    });

    await Promise.all(promises);
    console.log("Finished processing all songs");
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

  console.log("Setting up search functionality");

  // Show search results container when user starts typing
  searchInput.addEventListener("input", async function () {
    const query = searchInput.value.trim();
    console.log("Search query:", query);

    // Clear results and hide container if query is empty
    if (query.length === 0) {
      searchResults.innerHTML = "";
      searchResults.style.display = "none";
      return;
    }

    try {
      console.log("Fetching search results for:", query);
      const response = await fetch(
        `/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Search results received:", data);
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

    // Limit the number of results to 8
    const limitedResults = results.slice(0, 8);

    limitedResults.forEach((result) => {
      const resultItem = document.createElement("div");
      resultItem.classList.add("search-result-item");

      if (result.type === "user") {
        resultItem.innerHTML = `<span style="color: grey;">user: </span><span style="color: var(--darkBlue);">${result.username}</span>`;
      } else if (result.type === "album") {
        resultItem.innerHTML = `<span style="color: grey;">album: </span><span style="color: var(--darkBlue);">${result.name}</span>`;
      } else if (result.type === "music") {
        resultItem.innerHTML = `<span style="color: grey;">song: </span><span style="color: var(--darkBlue);">${result.name}</span>`;
      } else if (result.type === "artist") {
        resultItem.innerHTML = `<span style="color: var(--orange);">artist: </span><span style="color: var(--darkBlue);">${result.username}</span>`;
      }

      // Add click event to navigate to appropriate page
      resultItem.addEventListener("click", function () {
        if (result.type === "user" || result.type === "artist") {
          window.location.href = `/user/${result.username}`;
        } else if (result.type === "album") {
          window.location.href = `/album/${result._id}`;
        } else if (result.type === "music") {
          window.location.href = `/review/${result._id}`;
        }
      });

      searchResults.appendChild(resultItem);
    });
  }
});

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

async function getSongReviews(songId) {
  try {
    const response = await fetch(`/api/songs/${songId}/reviews`);
    if (!response.ok) {
      throw new Error("Failed to fetch song reviews");
    }
    const data = await response.json();
    return data.reviews;
  } catch (error) {
    console.error("Error fetching song reviews:", error);
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
    console.log("Liked song", songId, "new likes:", data.likes);
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
    console.log("Unliked song", songId, "new likes:", data.likes);
    return data.likes;
  } catch (error) {
    console.error("Error unliking song:", error);
    return [];
  }
}