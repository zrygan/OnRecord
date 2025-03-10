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

      <form id="musicForm" onsubmit="addMusic(); return false;">
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

        <!-- Album Field (for songs) -->
        <div id="albumField" class="album_field" style="display: none;">
          <label for="album">Album of the song:</label>
          <input
            type="text"
            id="album"
            name="album"
            placeholder="Enter album name"
          />
        </div>

        <!-- Submit Button -->
        <button class="submit_button" type="submit">Submit</button>
      </form>
    `);
  };

  window.search_controlpanel = function () {
    updateControlPanel(`
      <h3>Searching for a music or album</h3>
      <form action="musicForm">
        <!-- Search music or allbum -->
        <label for="name">Album or Song Name:</label>
        <input
          type="text"
          id="type"
          name="type"
          placeholder="Artist or Song Name"
        />

        <label for="artist">Artist (comma-separated):</label>
        <input
          type="text"
          id="artist"
          name="artist"
          placeholder="Artist1, Artist2"
        />

        <label for="release_date">Release Date:</label>
        <input type="date" id="release_date" name="release_date" />
      </form>
    `);
  };

  window.editDel_controlpanel = function () {
    updateControlPanel(`
      <h3>Edit or Delete a Song</h3>
      <p>Input the song name first before you edit or delete it.</p>
      <form id="musicForm" onsubmit="populateForm(); return false;">
        <label for="songName">Song Name:</label>
        <input
          type="text"
          id="songName"
          name="songName"
          oninput="populateForm()"
          required
          placeholder="Enter song name"
        />

        <p id="song_name_not_found" style="display: none; color: red;"></p>
        <div id="songDetails" class="album_field" style="display: none;"><br>
          <label for="artist">Artist:</label><br>
          <input type="text" id="artist" name="artist" placeholder="Enter artist name" /><br>
          <br>
          <label for="album">Album:</label><br>
          <input type="text" id="album" name="album" placeholder="Enter album name" /><br>
          <br>
          <label for="genre">Genre:</label><br>
          <input type="text" id="genre" name="genre" placeholder="Enter genre" /><br>
          <br>
          <label for="year">Year:</label><br>
          <input type="text" id="year" name="year" placeholder="Enter year" /><br>
          <br>
          <label for="description">Description:</label><br>
          <textarea id="description" name="description" placeholder="Enter description"></textarea><br>

          <button class="submit_button" type="button" onclick="editSong()">Edit</button>
          <button class="submit_button" type="button" onclick="deleteSong()">Delete</button>
        </div>
      </form>
    `);
  };
});

function populateForm() {
  const songName = document.getElementById("songName").value;
  const songDetails = document.getElementById("songDetails");
  const songname_not_found = document.getElementById("song_name_not_found");

  // sample data just to test the form
  const database = [
    {
      name: "Song1",
      artist: "Artist1",
      album: "Album1",
      genre: "Pop",
      year: "2020",
      description: "Description of Song1",
    },
    {
      name: "Song2",
      artist: "Artist2",
      album: "Album2",
      genre: "Rock",
      year: "2019",
      description: "Description of Song2",
    },
  ];

  const song = database.find(
    (s) => s.name.toLowerCase() === songName.toLowerCase()
  );

  if (song) {
    document.getElementById("artist").value = song.artist;
    document.getElementById("album").value = song.album;
    document.getElementById("genre").value = song.genre;
    document.getElementById("year").value = song.year;
    document.getElementById("description").value = song.description;
    songDetails.style.display = "block";
    songname_not_found.style.display = "none";
  } else {
    songDetails.style.display = "none";
    songname_not_found.style.display = "block";
    songname_not_found.innerHTML = `Song with name <b>${songName}</b> not found.`;
  }
}

function editSong() {
  // TODO
}

function deleteSong() {
  // TODO
}
