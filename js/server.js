// This file is the server file for the project
// It will be used to handle the requests and responses
// from the client side

const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose"); 
const { User } = require("../model/user");
const Album = require("../model/album");
const { read_music_all } = require("../model/music");
const { Music } = require("../model/music");
const { Review } = require("../model/review");
const session = require("express-session");

// Register the 'eq' helper
hbs.registerHelper("eq", function (a, b, options) {
  if (a === b) {
    return true; // Execute the block inside the helper
  } else {
    return false; // Execute the else block (if any)
  }
});

// Example usage of count method
const countMusic = async () => {
  try {
    const count = await Music.count({}); // Use count instead of countDocuments
    console.log(`Total music documents: ${count}`);
  } catch (error) {
    console.error("Error counting music documents:", error.message);
  }
};

countMusic();

app.get("/api/metrics", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const artists = await User.countDocuments({ type: "artist" });
    const tracks = await Music.countDocuments();
    const albums = await Album.countDocuments();

    // Return the metrics as a response
    res.json({
      users,
      artists,
      tracks,
      albums,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.get("/api/music", async (req, res) => {
  try {
    const musicData = await Music.find();
    res.json(musicData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch music data" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const userData = await User.find();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch music data" });
  }
});

// Admin API - Create new music
app.post("/api/admin/music", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const {
      name,
      artists,
      album,
      release_date,
      genres,
      description,
      image,
      likes,
      listen_count,
      like_count,
      dislike_count,
      comment_count,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !artists ||
      !album ||
      !release_date ||
      !genres ||
      !description
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if music already exists
    const musicExists = await Music.findOne({ name, artists });
    if (musicExists) {
      return res
        .status(400)
        .json({ error: "A song with this name and artist already exists" });
    }

    // Create new music
    const newMusic = new Music({
      name,
      artists,
      album,
      release_date: new Date(release_date),
      genres,
      description,
      image: image || "../img/albums/default.jpg",
      likes: likes || [],
      listen_count: listen_count || 0,
      like_count: like_count || 0,
      dislike_count: dislike_count || 0,
      comment_count: comment_count || 0,
    });

    await newMusic.save();
    res.status(201).json({ success: true, music: newMusic });
  } catch (error) {
    console.error("Error creating music:", error);
    res.status(500).json({ error: "Failed to create music" });
  }
});

// Admin API - Search for music
app.get("/api/admin/music/search", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, artist, date } = req.query;

    // Build search query
    const query = {};
    if (name) query.name = new RegExp(name, "i");
    if (artist) query.artists = new RegExp(artist, "i");
    if (date)
      query.release_date = {
        $gte: new Date(date),
        $lt: new Date(date + "T23:59:59"),
      };

    // If searching for a specific song by name
    if (req.query.name && !req.query.artist && !req.query.date) {
      const song = await Music.findOne({
        name: new RegExp(`^${req.query.name}$`, "i"),
      });
      return res.json({ song });
    }

    // Search for songs
    const songs = await Music.find(query).limit(20);
    res.json({ songs });
  } catch (error) {
    console.error("Error searching music:", error);
    res.status(500).json({ error: "Failed to search music" });
  }
});

// Admin API - Update music
app.put("/api/admin/music/:id", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, artists, album, release_date, genres, description } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !artists ||
      !album ||
      !release_date ||
      !genres ||
      !description
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update music
    const updatedMusic = await Music.findByIdAndUpdate(
      req.params.id,
      {
        name,
        artists,
        album,
        release_date: new Date(release_date),
        genres,
        description,
      },
      { new: true }
    );

    if (!updatedMusic) {
      return res.status(404).json({ error: "Music not found" });
    }

    res.json({ success: true, music: updatedMusic });
  } catch (error) {
    console.error("Error updating music:", error);
    res.status(500).json({ error: "Failed to update music" });
  }
});

// Admin API - Delete music
app.delete("/api/admin/music/:id", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete music
    const deletedMusic = await Music.findByIdAndDelete(req.params.id);

    if (!deletedMusic) {
      return res.status(404).json({ error: "Music not found" });
    }

    // Also delete associated reviews
    await Review.deleteMany({ songName: deletedMusic.name });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting music:", error);
    res.status(500).json({ error: "Failed to delete music" });
  }
});

// Get Username of the User
app.get("/api/current-username", (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.status(401).json({ error: "User not logged in" });
  }
});

// Get the likes for a song
app.get("/api/songs/:id/likes", async (req, res) => {
  try {
    const song = await Music.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json({ likes: song.likes });
  } catch (error) {
    console.error("Error fetching song likes:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Like a song
app.post("/api/songs/:id/like", async (req, res) => {
  try {
    const song = await Music.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const username = req.body.username;
    if (!song.likes.includes(username)) {
      song.likes.push(username);
      await song.save();
    }
    res.json({ likes: song.likes });
  } catch (error) {
    console.error("Error liking song:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Unlike a song
app.post("/api/songs/:id/unlike", async (req, res) => {
  try {
    const song = await Music.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    const username = req.body.username;
    song.likes = song.likes.filter((user) => user !== username);
    await song.save();
    res.json({ likes: song.likes });
  } catch (error) {
    console.error("Error unliking song:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const viewPath = path.join(__dirname, "../pages");

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", viewPath);

// Serve static files from root directory
app.use(express.static(path.join(__dirname, "../")));

// Configure session middleware
app.use(
  session({
    secret: "SUPER-DUPER-SECRET-KEY-NO-ONE-CAN-KNOW", // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Root route to serve index page
app.get("/", async (req, res) => {
  try {
    // Get 9 random songs for album covers
    const cover_photos = await Music.aggregate([{ $sample: { size: 9 } }]);
    res.render("index", { cover_photos });
  } catch (error) {
    console.error("Error fetching random songs:", error);
    // Render without random songs if there's an error
    res.render("index");
  }
});

// Route to render home page
app.get("/home", async (req, res) => {
  try {
    const music = await Music.find();
    let user = req.session.user;

    user = await checkUser(user);

    const randomSongs = await Music.aggregate([{ $sample: { size: 15 } }]);

    const musicWithCounts = await Promise.all(
      music.map(async (song) => {
        const reviews = await Review.countDocuments({ songId: song._id });
        return {
          ...song.toObject(),
          hearts: song.likes.length,
          reviews: reviews,
        };
      })
    );

    res.render("home", { music: musicWithCounts, randomSongs, user });
  } catch (error) {
    console.error("Error fetching music data:", error);
    res.status(500).send("Error fetching music data");
  }
});

// Charts
app.get("/charts", async (req, res) => {
  try {
    let user = req.session.user;
    if (!checkUser(user)) {
      return res.status(500).send("User not found in the database.");
    }
    res.render("charts", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching charts data");
  }
});

app.get("/charts-popular", async (req, res) => {
  try {
    const music = await Music.find();

    let user = req.session.user;

    if (!checkUser(user)) {
      return res.status(500).send("User not found in the database.");
    }

    res.render("charts-popular", { user, music });
  } catch (error) {
    console.error("Error fetching charts data:", error);
    res.status(500).send("Error fetching charts data");
  }
});

app.get("/charts-critical", async (req, res) => {
  try {
    const music = await Music.find();

    let user = req.session.user;

    if (!checkUser(user)) {
      return res.status(500).send("User not found in the database.");
    }

    res.render("charts-critical", { user, music });
  } catch (error) {
    console.error("Error fetching charts data:", error);
    res.status(500).send("Error fetching charts data");
  }
});

app.get("/charts-based", async (req, res) => {
  try {
    const music = await Music.find();

    let user = req.session.user;

    if (!checkUser(user)) {
      return res.status(500).send("User not found in the database.");
    }

    res.render("charts-based", { user, music });
  } catch (error) {
    console.error("Error fetching charts data:", error);
    res.status(500).send("Error fetching charts data");
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // First check if User exists with that username
    const userExists = await User.findOne({ username });

    if (userExists) {
      // If User exists, check password separately
      const passwordMatch = await User.findOne({ username, password });

      if (passwordMatch) {
        // Set default image if none exists
        if (!passwordMatch.image) {
          passwordMatch.image = "../img/default-user.png"; // Ensure this default image exists
        }

        req.session.user = passwordMatch; // Store user information in session
        res.status(200).json({
          success: true,
          User: {
            username: passwordMatch.username,
            type: passwordMatch.type,
          },
        });
      } else {
        // User exists but password doesn't match
        res.status(401).json({ error: `Incorrect password for ${username}.` });
      }
    } else {
      // User doesn't exist
      res.status(401).json({
        error: `The account ${username} doesn't exist, please register first.`,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error, please try again" });
  }
});

// Register endpoint
// Check username and email availability
app.post("/register/check-availability", async (req, res) => {
  const { username, email } = req.body;

  try {
    const [usernameExists, emailExists] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (usernameExists) {
      return res.status(400).json({
        error: `Username ${username} is already taken, please choose another.`,
      });
    }

    if (emailExists) {
      return res.status(400).json({
        error: `Email ${email} is already registered.`,
      });
    }

    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Availability check error:", e);
    res
      .status(500)
      .json({ error: "Error checking availability. Please try again." });
  }
});

// Register endpoint
// Register endpoint
app.post("/register", async (req, res) => {
  const data = {
    surname: req.body.surname,
    firstname: req.body.firstname,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    birthday: req.body.birthday,
    image: "../img/default-user.png", // Add a default image
    type:
      req.body.email && req.body.email.endsWith("@onrecord.com")
        ? "admin"
        : req.body.email && req.body.email.endsWith("@artists.onrecord.com")
        ? "artist"
        : "normal",
  };

  try {
    const newUser = new User(data);
    await newUser.save();

    // Automatically log in the user after registration
    req.session.user = newUser;

    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Registration failed", e });
  }
});

// FROM https://expressjs.com/en/resources/middleware/session.html
app.get("/logout", function (req, res, next) {
  // logout logic

  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.user = null;
  req.session.save(function (err) {
    if (err) {
      return next(err);
    }

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) {
        return next(err);
      }

      res.redirect("/");
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.get("/review/:id", async (req, res) => {
  try {
    let user = req.session.user;

    if (!user) {
      return res.status(401).send("User not logged in");
    }

    const songID = req.params.id;

    if (!songID) {
      return res.status(400).send("Invalid song ID");
    }

    // Find the song by its ID
    const song = await Music.findById(songID);
    if (!song) return res.status(404).send("Song not found");

    // Fetch all reviews for this song
    const reviews = await Review.find({ songName: song.name });

    // Render the review page with song details and reviews
    res.render("review", {
      pageTitle: song.name,
      songTitle: song.name,
      artist: song.artists.join(", "),
      albumCover: song.image,
      releaseDate: song.release_date.toDateString(),
      songGenres: song.genres,
      songDescription: song.description,
      songRating: reviews.length
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "No ratings yet",
      reviews: reviews,
      user,
    });
  } catch (error) {
    console.error("Error fetching song and reviews:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

async function checkUser(user) {
  // TODO: make this thing not return any routes after logout mechanic is implemented
  try {
    if (!user) {
      user = {
        surname: "Dummy",
        firstname: "User",
        email: "dummy@example.com",
        username: "Anonymous",
        password: "password",
        birthday: "1990-01-01T00:00:00.000Z",
        date_created: "2025-03-11T00:00:00.000Z",
        type: "normal",
      };
      return false;
    }
    const foundUser = await User.findOne({ username: user.username });
    return foundUser || false;
  } catch (error) {
    console.error("Error checking user:", error);
    return false;
  }
}

app.post("/submit-review", async (req, res) => {
  try {
    const { userName, userPic, songName, comment, rate } = req.body;

    if (!userName || !songName || !comment || !rate) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newReview = new Review({
      userName,
      userPic,
      songName,
      comment,
      rating: parseInt(rate, 10),
    });

    console.log(req.body);

    await newReview.save();
    res
      .status(201)
      .json({ message: "Review submitted successfully!", review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    const users = await User.find({ username: new RegExp(query, "i") });
    const albums = await Album.find({ name: new RegExp(query, "i") });
    const songs = await Music.find({ name: new RegExp(query, "i") });
    const artists = await User.find({
      username: new RegExp(query, "i"),
      type: true,
    });

    const results = [
      ...users.map((user) => ({ type: "user", _id: user._id, username: user.username })),
      ...albums.map((album) => ({ type: "album", _id: album._id, name: album.name })),
      ...songs.map((music) => ({ type: "music", _id: music._id, name: music.name })),
      ...artists.map((artist) => ({ type: "artist", _id: artist._id, username: artist.username })),
    ];

    res.json(results);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).send("Error fetching search results");
  }
});

// Route to render user profile page
app.get("/user/:id", async (req, res) => {
  try {
    let user = req.session.user;

    if (!user) {
      return res.status(401).send("User not logged in");
    }

    const userId = req.params.id;

    if (!userId) {
      return res.status(400).send("Invalid user ID");
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID format");
    }

    // Find the user by their ID
    const profileUser = await User.findById(userId);
    if (!profileUser) return res.status(404).send("User not found");

    // Render the user profile page with user details
    res.render("userpage", {
      pageTitle: profileUser.username,
      username: profileUser.username,
      profilePicture: profileUser.image,
      bio: profileUser.bio,
      customNote: profileUser.customNote,
      status: profileUser.status,
      accountCreated: profileUser.date_created.toDateString(),
      countryOrigin: profileUser.countryOrigin,
      feel: profileUser.feel,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a review
app.delete("/delete-review/:id", async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin dashboard route
app.get("/admin", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.type !== "admin") {
      console.log("Unauthorized access attempt to admin panel");
      return res.redirect("/home");
    }

    res.render("admin/admin", { user });
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    res.status(500).send("Error loading admin dashboard");
  }
});

// used for checking if the user is an admin or not
// for the home.hbs
async function checkUser(user) {
  try {
    if (!user) {
      return {
        surname: "Dummy",
        firstname: "User",
        email: "dummy@example.com",
        username: "Anonymous",
        password: "password",
        birthday: "1990-01-01T00:00:00.000Z",
        date_created: "2025-03-11T00:00:00.000Z",
        type: "normal",
      };
    }
    const foundUser = await User.findOne({ username: user.username });
    return foundUser || user; // Return the database user or the session user
  } catch (error) {
    console.error("Error checking user:", error);
    return user; // Return the original user if there's an error
  }
}

// Admin music management page
app.get("/admin/music", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.type !== "admin") {
      console.log("Unauthorized access attempt to music admin");
      return res.redirect("/home");
    }

    res.render("admin/music_database", { user });
  } catch (error) {
    console.error("Error loading admin music page:", error);
    res.status(500).send("Error loading admin music page");
  }
});

// FIXME: @mentosberi and/or @tsuruyu
// add your Admin user manage page route here
app.get("/admin/music", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.type !== "admin") {
      console.log("Unauthorized access attempt to music admin");
      return res.redirect("/home");
    }

    res.render("admin/userpage_admin", { user });
  } catch (error) {
    console.error("Error loading admin music page:", error);
    res.status(500).send("Error loading admin music page");
  }
});

app.put("/edit-review/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { comment, rating } = req.body;

      if (!comment || comment.trim() === "") {
          return res.status(400).json({ error: "Review comment cannot be empty." });
      }

      const updatedReview = await Review.findByIdAndUpdate(
          id,
          { comment: comment, rating: rating },
          { new: true, runValidators: true }
      );

      if (!updatedReview) {
          return res.status(404).json({ error: "Review not found." });
      }

      res.json({ success: true, message: "Review updated successfully.", updatedReview });
  } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});
