function toggleAlbumField() {
  const typeSelect = document.getElementById("type");
  const albumField = document.getElementById("albumField");

  if (typeSelect.value === "album") {
    albumField.style.display = "none";
  } else {
    albumField.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const controlPanel = document.getElementById("control_panel");

  // Automatically show the Add panel when the page loads
  setTimeout(() => {
    add_controlpanel();
  }, 100);
});

function updateControlPanel(content) {
  const controlPanel = document.getElementById("control_panel");
  controlPanel.innerHTML = content;

  // Reinitialize any event listeners
  const typeSelect = document.getElementById("type");
  if (typeSelect) {
    typeSelect.addEventListener("change", toggleAlbumField);
    toggleAlbumField();
  }
}

// Add Control Panel
window.add_controlpanel = function () {
  updateControlPanel(`
    <h3>Add Music</h3>
    <form id="musicForm" onsubmit="addMusic(); return false;">
 
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" placeholder="Name of song or album" required />

      <label for="artists">Artists (comma-separated):</label>
      <input
        type="text"
        id="artists"
        name="artists"
        placeholder="Artist1, Artist2, etc."
        required
      />

      <label for="album">Album:</label>
      <input type="text" id="album" name="album" placeholder="Album name" />

      <label for="image">Image URL:</label>
      <input type="text" id="image" name="image" placeholder="URL of the Song Cover"  />

      <label for="release_date">Release Date:</label>
      <input type="date" id="release_date" name="release_date" required />

      <label for="genres">Genres (comma-separated):</label>
      <input
        type="text"
        id="genres"
        name="genres"
        placeholder="Genre1, Genre2, etc."
        required
      />

      <label for="description">Description:</label>
      <textarea
        id="description"
        name="description"
        placeholder="Description of the song or album"
        rows="4"
        required
      ></textarea>

      <button class="submit_button" type="submit">Add to Database</button>
    </form>
  `);
};

// Edit/Delete Control Panel
window.editDel_controlpanel = function () {
  updateControlPanel(`
    <h3>Edit or Delete Music</h3>
    <form id="searchForm" onsubmit="populateForm(); return false;">
      <label for="songName">Song/Album Name:</label>
      <input
        type="text"
        id="songName"
        name="songName"
        placeholder="Enter exact name to find"
        required
      />
      <button class="submit_button" type="submit">Find</button>
    </form>
    <div id="song_name_not_found" style="color:red; margin-top:10px; display:none;"></div>
    <div id="songDetails" style="display:none; margin-top:20px;">
      <h3>Edit Song Details</h3>
      <form onsubmit="editSong(); return false;">
        <label for="artist">Artists:</label>
        <input type="text" id="artist" name="artist" required />

        <label for="album">Album:</label>
        <input type="text" id="album" name="album" required />
        
        <label for="image">Image URL:</label>
        <input type="text" id="image" name="image" required />

        <label for="genre">Genres:</label>
        <input type="text" id="genre" name="genre" required />

        <label for="year">Release Year:</label>
        <input type="number" id="year" name="year" min="1900" max="2099" required />

        <label for="description">Description:</label>
        <textarea id="description" name="description" rows="4" required></textarea>

        <div style="display:flex; gap:20px; margin-top:20px;">
          <button class="submit_button" type="submit">Update Song</button>
          <button class="submit_button" type="button" style="background-color:red;" onclick="deleteSong()">Delete Song</button>
        </div>
      </form>
    </div>
  `);
};

// Add Music function - Creates a new song or album in the database
async function addMusic() {
  try {
    // Get form values
    const name = document.getElementById("name").value;
    const artistsInput = document.getElementById("artists").value;
    const artists = artistsInput.split(",").map((artist) => artist.trim());
    const releaseDate = document.getElementById("release_date").value;
    const genresInput = document.getElementById("genres").value;
    const genres = genresInput.split(",").map((genre) => genre.trim());
    const description = document.getElementById("description").value;
    const album = document.getElementById("album").value;

    // Default image based on genre (you can customize this)
    const image = `../img/albums/${genres[0].toLowerCase()}.jpg`;

    // Create the data object
    const musicData = {
      name,
      artists,
      album,
      release_date: releaseDate,
      genres,
      description,
      image,
      likes: [],
      listen_count: 0,
      like_count: 0,
      dislike_count: 0,
      comment_count: 0,
    };

    // Send POST request to create music
    const response = await fetch("/api/admin/music", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(musicData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Music added successfully!");
      document.getElementById("musicForm").reset();
    } else {
      alert(`Failed to add music: ${result.error}`);
    }
  } catch (error) {
    console.error("Error adding music:", error);
    alert("An error occurred while adding music.");
  }
}

// Populate form with song details from database for editing
async function populateForm() {
  const songName = document.getElementById("songName").value;
  const songDetails = document.getElementById("songDetails");
  const songNameNotFound = document.getElementById("song_name_not_found");

  if (!songName.trim()) {
    songDetails.style.display = "none";
    songNameNotFound.style.display = "none";
    return;
  }

  try {
    // Fetch song details from API
    const response = await fetch(
      `/api/admin/music/search?name=${encodeURIComponent(songName)}`
    );
    const data = await response.json();

    if (response.ok && data.song) {
      const song = data.song;

      // Update input field with the data from database to maintain exact details
      document.getElementById("songName").value = song.name;
      document.getElementById("artist").value = song.artists.join(", ");
      document.getElementById("album").value = song.album;
      document.getElementById("image").value = song.image; // New image URL field
      document.getElementById("genre").value = song.genres.join(", ");
      document.getElementById("year").value = new Date(
        song.release_date
      ).getFullYear();
      document.getElementById("description").value = song.description;

      // Store song ID for edit/delete operations
      document.getElementById("songDetails").dataset.songId = song._id;

      songDetails.style.display = "block";
      songNameNotFound.style.display = "none";
    } else {
      songDetails.style.display = "none";
      songNameNotFound.style.display = "block";
      songNameNotFound.innerHTML = `Song with name <b>${songName}</b> not found.`;
    }
  } catch (error) {
    console.error("Error fetching song details:", error);
    alert("An error occurred while fetching song details.");
  }
}

// Edit song in the database
async function editSong() {
  try {
    const songId = document.getElementById("songDetails").dataset.songId;
    if (!songId) {
      alert("No song selected for editing.");
      return;
    }

    // Get updated values from form
    const name = document.getElementById("songName").value;
    const artistsInput = document.getElementById("artist").value;
    const artists = artistsInput.split(",").map((artist) => artist.trim());
    const album = document.getElementById("album").value;
    const genresInput = document.getElementById("genre").value;
    const genres = genresInput.split(",").map((genre) => genre.trim());
    const year = document.getElementById("year").value;
    const description = document.getElementById("description").value;

    // Create release date from year
    const releaseDate = `${year}-01-01`;

    // Create updated song data
    const updatedSong = {
      name,
      artists,
      album,
      release_date: releaseDate,
      genres,
      description,
    };

    // Send PUT request to update music
    const response = await fetch(`/api/admin/music/${songId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSong),
    });

    const result = await response.json();

    if (response.ok) {
      // Update the input field with the exact name from the server response
      // This ensures the case sensitivity matches what's in the database
      if (result.music && result.music.name) {
        document.getElementById("songName").value = result.music.name;
      }

      alert("Song updated successfully!");

      // Refresh the form with the updated data
      populateForm();
    } else {
      alert(`Failed to update song: ${result.error}`);
    }
  } catch (error) {
    console.error("Error updating song:", error);
    alert("An error occurred while updating the song.");
  }
}

// Delete song from the database
async function deleteSong() {
  try {
    const songId = document.getElementById("songDetails").dataset.songId;
    if (!songId) {
      alert("No song selected for deletion.");
      return;
    }

    // Confirm deletion
    if (
      !confirm(
        "Are you sure you want to delete this song? This action cannot be undone."
      )
    ) {
      return;
    }

    // Send DELETE request
    const response = await fetch(`/api/admin/music/${songId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Song deleted successfully!");
      document.getElementById("songName").value = "";
      document.getElementById("songDetails").style.display = "none";
    } else {
      const result = await response.json();
      alert(`Failed to delete song: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deleting song:", error);
    alert("An error occurred while deleting the song.");
  }
}

// Search for songs in the database
async function searchMusic() {
  try {
    const name = document.getElementById("type").value;
    const artist = document.getElementById("artist").value;
    const releaseDate = document.getElementById("release_date").value;

    // Build query parameters
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (artist) params.append("artist", artist);
    if (releaseDate) params.append("date", releaseDate);

    const response = await fetch(
      `/api/admin/music/search?${params.toString()}`
    );
    const data = await response.json();

    if (response.ok && data.songs && data.songs.length > 0) {
      // Display search results
      let resultsHtml = '<h3>Search Results</h3><div class="search-results">';
      data.songs.forEach((song) => {
        resultsHtml += `
          <div class="search-result-item">
            <h4>${song.name}</h4>
            <p>Artist: ${song.artists.join(", ")}</p>
            <p>Album: ${song.album}</p>
            <p>Released: ${new Date(song.release_date).toLocaleDateString()}</p>
          </div>
        `;
      });
      resultsHtml += "</div>";

      // Add results to the control panel
      const controlPanel = document.getElementById("control_panel");
      controlPanel.innerHTML += resultsHtml;
    } else {
      alert("No songs found matching your criteria.");
    }
  } catch (error) {
    console.error("Error searching music:", error);
    alert("An error occurred while searching for music.");
  }
}
