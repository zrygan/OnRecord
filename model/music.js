const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/onrecord")
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB"));

const schema_music = new mongoose.Schema({
  name: { type: String, required: true },
  artists: { type: [String], required: true },
  album: { type: String, required: true },
  release_date: { type: Date, required: true },
  genres: { type: [String], required: true },
  description: { type: String, required: true },
});

const Music = mongoose.model("User", schema_music);

// CRUD Functions

const create_music = async (
  name,
  artists,
  album,
  release_date,
  genres,
  description
) => {
  try {
    const new_music = new Music({
      name,
      artists,
      album,
      release_date,
      genres,
      description,
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
    console.log("All music:", music);
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
  description
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
