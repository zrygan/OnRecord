function toggleAlbumField() {
  const typeSelect = document.getElementById("type");
  const albumField = document.getElementById("albumField");

  if (typeSelect.value === "album") {
    albumField.style.display = "none";
  } else {
    albumField.style.display = "flex";
  }
}

document.addEventListener("DOMContentLoaded", toggleAlbumField);

document.addEventListener("DOMContentLoaded", function () {
  const controlPanel = document.getElementById("control_panel");

  function updateControlPanel(content) {
    controlPanel.innerHTML = content;
  }

  window.add_controlpanel = function () {
    updateControlPanel(`
      <h3>Adding music or albums</h3>
        <p>Enter the music details below, all details are <b>required</b>.</p>

        <form id="musicForm">
          <!-- Type Selection -->
          <label for="type">Type:</label>
          <select id="type" name="type" required onchange="toggleAlbumField()">
            <option value="song">Song</option>
            <option value="album">Album</option>
          </select>

          <!-- Name Input -->
          <label for="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Enter name"
          />

          <!-- Artists Input (Array) -->
          <label for="artists">Artists (comma-separated):</label>
          <input
            type="text"
            id="artists"
            name="artists"
            required
            placeholder="e.g. Artist1, Artist2"
          />

          <!-- Release Date -->
          <label for="release_date">Release Date:</label>
          <input type="date" id="release_date" name="release_date" required />

          <!-- Genres Input (Array) -->
          <label for="genres">Genres (comma-separated):</label>
          <input
            type="text"
            id="genres"
            name="genres"
            required
            placeholder="e.g. Pop, Rock"
          />

          <!-- Description -->
          <label for="description">Description:</label>
          <textarea
            id="description"
            name="description"
            required
            placeholder="Enter description"
          ></textarea>
        </form>

        <!-- secondary form for song's album -->
        <form id="albumField" class="album_field">
          <label style="text-align: left" for="album">Album of the song:</label>
          <input
            type="text"
            id="album"
            name="album"
            placeholder="Enter album name"
          />
        </form>

        <!-- submit button -->
        <button class="submit_button" type="submit">Submit</button>
    `);
  };

  window.search_controlpanel = function () {
    updateControlPanel(`
      <h3>Search Music or Album</h3>
      <p>TO COME LATER ON</p>
    `);
  };

  window.editDel_controlpanel = function () {
    updateControlPanel(`
      <h3>Edit or Delete Music/Album</h3>
      <p>TO COME LATER ON</p>
    `);
  };
});
