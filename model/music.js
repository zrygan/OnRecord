const fs = require("fs");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/onrecord", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB"));

const schema_music = new mongoose.Schema({
  name: { type: String, required: true },
  artists: { type: [String], required: true },
  album: { type: String, required: true },
  release_date: { type: Date, required: true },
  genres: { type: [String], required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  likes: { type: [String], default: [] }
});

const Music = mongoose.model("Music", schema_music);

// Read JSON file
fs.readFile("data\\music.json", "utf8", async (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    // Parse JSON data
    const musicData = JSON.parse(data);

    // Empty the Music collection
    await Music.deleteMany({});
    console.log("Music collection emptied");

    // Insert the data into the database
    await Music.insertMany(musicData);
    console.log("Music Data inserted successfully");
  } catch (err) {
    console.error("Error processing data:", err);
  }
});

// CRUD Functions

const create_music = async (
  name,
  artists,
  album,
  release_date,
  genres,
  description,
  image,
  likes = []
) => {
  try {
    const new_music = new Music({
      name,
      artists,
      album,
      release_date,
      genres,
      description,
      image,
      likes
    });

    await new_music.save();
    console.log("Music created:", new_music);
  } catch (error) {
    console.error("Error creating music:", error.message);
  }
};

const read_music_all = async () => {
  try {
    const music = await Music.find();
    return music;
  } catch (error) {
    console.error("Error reading music:", error.message);
  }
};

const read_music = async (id, name, artists) => {
  try {
    const music = await Music.findOne({
      $or: [{ _id: id }, { name: name }, { artists: artists }],
    });
    if (!music) {
      console.log("Music not found");
    } else {
      console.log("Music found:", music);
    }
  } catch (error) {
    console.error("Error reading music:", error.message);
  }
};

const update_music = async (
  id,
  name,
  artists,
  album,
  release_date,
  genres,
  description,
  image,
  likes
) => {
  try {
    const updatedMusic = await Music.findByIdAndUpdate(
      id,
      {
        name,
        artists,
        album,
        release_date,
        genres,
        description,
        image,
        likes
      },
      { new: true }
    );

    if (!updatedMusic) {
      console.log("Music not found");
    } else {
      console.log("Music updated:", updatedMusic);
    }
  } catch (error) {
    console.error("Error updating music:", error.message);
  }
};

const delete_music = async (id) => {
  try {
    const deletedMusic = await Music.findByIdAndDelete(id);

    if (!deletedMusic) {
      console.log("Music not found");
    } else {
      console.log("Music deleted:", deletedMusic);
    }
  } catch (error) {
    console.error("Error deleting music:", error.message);
  }
};

const musicExists = async (name, artists, album) => {
  console.log("Checking existence for:", { name, artists, album }); // Debugging statement
  const existingMusic = await Music.find({ name, artists, album });
  console.log("Existing music found:", existingMusic); // Debugging statement
  return existingMusic.length > 0;
};

// Export the functions and model
module.exports = {
  create_music,
  read_music_all,
  read_music,
  update_music,
  delete_music,
  musicExists,
  Music,
};
