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