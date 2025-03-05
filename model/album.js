const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/onrecord")
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB"));

const schema_album = new mongoose.Schema({
  name: { type: String, required: true },
  artists: { type: [String], required: true },
  release_date: { type: Date, required: true },
  genres: { type: [String], required: true },
  description: { type: String, required: true },
});

// CRUD Functions

const create_album = async (
  name,
  artists,
  release_date,
  genres,
  description
) => {
  try {
    const new_album = new Album({
      name,
      artists,
      release_date,
      genres,
      description,
    });

    await new_album.save();
    console.log("Album created:", new_album);
  } catch (error) {
    console.error("Error creating album:", error.message);
  }
};

const read_album_all = async () => {
  try {
    const albums = await Album.find();
    console.log("All albums:", albums);
  } catch (error) {
    console.error("Error reading albums:", error.message);
  }
};

const read_album = async (id, name, artists) => {
  try {
    const album = await Album.findOne({
      $or: [{ _id: id }, { name: name }, { artists: artists }],
    });
    if (!album) {
      console.log("Album not found");
    } else {
      console.log("Album found:", album);
    }
  } catch (error) {
    console.error("Error reading album:", error.message);
  }
};

const update_album = async (
  id,
  name,
  artists,
  release_date,
  genres,
  description
) => {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(
      id,
      {
        name,
        artists,
        release_date,
        genres,
        description,
      },
      { new: true }
    );

    if (!updatedAlbum) {
      console.log("Album not found");
    } else {
      console.log("Album updated:", updatedAlbum);
    }
  } catch (error) {
    console.error("Error updating album:", error.message);
  }
};

const delete_album = async (id) => {
  try {
    const deletedAlbum = await Album.findByIdAndDelete(id);
    if (!deletedAlbum) {
      console.log("Album not found");
    } else {
      console.log("Album deleted");
    }
  } catch (error) {
    console.error("Error deleting album:", error.message);
  }
};

// Export the functions
const collection = mongoose.model("album", schema_album);

module.exports = collection;
