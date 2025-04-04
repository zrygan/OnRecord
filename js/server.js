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

const connectionURL = "mongodb+srv://admin:admin@onrecord.yempabo.mongodb.net/";

// Register the 'eq' helper
hbs.registerHelper("eq", function (a, b, options) {
  if (a === b) {
    return true; // Execute the block inside the helper
  } else {
    return false; // Execute the else block (if any)
  }
});

// Register the 'includes' helper
hbs.registerHelper("includes", function (array, value, options) {
  if (array && array.includes(value)) {
    return true;
  } else {
    return false;
  }
});

// Register the 'formatDate' helper
hbs.registerHelper("formatDate", function (dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
});

// Register the 'stars' helper
hbs.registerHelper("stars", function (rating) {
  let stars = "";
  for (let i = 0; i < rating; i++) {
    stars +=
      '<img id="star-fill" src="../svg/userpage/star-svgrepo-com.svg" style="width: 17px; height: 17px; position: relative; top: 2px;" />';
  }
  return new hbs.SafeString(stars);
});

// Example usage of count method
const countMusic = async () => {
  try {
    const count = await Music.countDocuments({}); // Use count instead of countDocuments
    console.log(`Total music documents: ${count}`);
  } catch (error) {
    console.error("Error counting music documents:", error.message);
  }
};

countMusic();

// Configure session middleware
app.use(
  session({
    secret: "SUPER-DUPER-SECRET-KEY-NO-ONE-CAN-KNOW", // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use(express.json());

mongoose
  .connect(connectionURL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting:", err));

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
      image:
        image ||
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9SgCxgQYReXX660xU9Pj5Te611cPR6OReL7_UXY4wXiTXg715_Jahfm0-NS2OmBvnzEA&usqp=CAU",
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
app.get("/api/current-username", async (req, res) => {
  let user = req.session.user;
  if (user) {
    res.json({ username: user.username });
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
    let user = req.session.user;
    const username = user.username;
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
    let user = req.session.user;
    const username = user.username;
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
    let user = req.session.user || null; // Set user to null if no logged-in user

    if (user) {
      user = await checkUser(user); // Check if the user exists in the database
    }

    const randomSongs = await Music.aggregate([{ $sample: { size: 15 } }]);

    const musicWithCounts = await Promise.all(
      music.map(async (song) => {
        const reviewsCount = await Review.countDocuments({
          songName: song.name,
        });
        return {
          ...song.toObject(),
          hearts: song.likes.length,
          reviews: reviewsCount,
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
    res.status(404).render("404");
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
    res.status(404).render("404");
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
    res.status(404).render("404");
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
    res.status(404).render("404");
  }
});

app.get("/profile", async (req, res) => {
  try {
    let user = req.session.user;
    console.log("Session user:", user);

    if (!checkUser(user) || user === null) {
      console.log("User not found in the database.");
      res.status(404).render("404");
    } else {
      // Fetch user's reviews and include song images
      const reviews = await Review.find({ user: user._id }).populate('song');
      const reviewsWithImages = reviews.map((review) => ({
        ...review.toObject(),
        songImage: review.song?.image || null
      }));

      res.render("userpage", {
        user,
        reviews: reviewsWithImages,
      });
    }
  } catch (error) {
    console.error("Error fetching user/music data:", error);
    res.status(404).render("404");
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    // First check if User exists with that username
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({
        error: `The account ${username} doesn't exist, please register first.`,
      });
    }

    console.log(`User found: ${username}, attempting password comparison`);

    try {
      // Use bcrypt directly for comparison as a test
      const passwordMatch = await user.comparePassword(password);
      console.log(`Password match result: ${passwordMatch}`);

      if (passwordMatch) {
        console.log(`Login successful for: ${username}`);

        // Set default image if none exists
        if (!user.image) {
          user.image = "../img/default-user.png";
        }

        req.session.user = user; // Store user information in session
        return res.status(200).json({
          success: true,
          User: {
            username: user.username,
            type: user.type,
          },
        });
      } else {
        console.log(`Incorrect password for: ${username}`);
        return res
          .status(401)
          .json({ error: `Incorrect password for ${username}.` });
      }
    } catch (err) {
      console.error("Password comparison error:", err);
      return res.status(500).json({ error: "Error verifying password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error, please try again" });
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
    let user = req.session.user || null; // Allow null for not logged-in users

    const songID = req.params.id;    

    if (!songID) {
      return res.status(400).send("Invalid song ID");
    }

    // Find the song by its ID
    const song = await Music.findById(songID);
    if (!song) return res.status(404).send("Song not found");

    // Fetch all reviews for this song\
    const reviews = await Review.find({ song: songID }).populate('user');

    // Render the review page with song details and reviews
    res.render("review", {
      songId: song._id,
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
      user, // Pass user to the view (null if not logged in)
    });
  } catch (error) {
    console.error("Error fetching song and reviews:", error.message);
    res.status(404).render("404");
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
    const { song, comment, rating } = req.body;
    const user = req.session.user?._id; // Get user ID from session

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!song || !comment || !rating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate song exists
    const songExists = await Music.exists({ _id: song });
    if (!songExists) {
      return res.status(404).json({ error: "Song not found" });
    }

    const newReview = new Review({
      user,          // ObjectId reference to User
      song,          // ObjectId reference to Music
      comment,
      rating: parseInt(rating, 10),
    });

    await newReview.save();
    
    // Optionally populate user info in response
    const populatedReview = await Review.findById(newReview._id)
      .populate('user', 'username');
    
    res.status(201).json({ 
      message: "Review submitted successfully!", 
      review: populatedReview 
    });
  } catch (error) {
    console.error("Error submitting review:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const query = req.query.query;

    // Search for users by username loosely, but exclude artists
    const users = await User.find({
      username: new RegExp(query, "i"),
      type: { $ne: "artist" },
    });

    // Search for songs by name loosely:
    const songsByName = await Music.find({ name: new RegExp(query, "i") });

    // Find album names that exactly match the query (case-insensitive)
    const matchingAlbums = await Music.distinct("album", {
      album: new RegExp("^" + query + "$", "i"),
    });

    // For each matching album, get all songs in that album:
    let albumSongResults = [];
    for (const album of matchingAlbums) {
      const albumSongs = await Music.find({ album });
      albumSongs.forEach((song) => {
        albumSongResults.push({
          type: "albumSong",
          id: song._id,
          name: song.name,
          album: song.album,
        });
      });
    }

    // Search for artists (users with type "artist")
    const artists = await User.find({
      username: new RegExp(query, "i"),
      type: "artist",
    });

    // Build the results combining all groups:
    const results = [
      ...users.map((user) => ({
        type: "user",
        id: user._id,
        username: user.username,
      })),
      ...songsByName.map((song) => ({
        type: "music",
        id: song._id,
        name: song.name,
      })),
      ...albumSongResults,
      ...artists.map((artist) => ({
        type: "artist",
        id: artist._id,
        username: artist.username,
      })),
    ];

    res.json(results);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).send("Error fetching search results");
  }
});

// Route to render user profile page
app.get("/user/:username", async (req, res) => {
  try {
    console.log("Fetching profile for username:", req.params.username);
    const profileUsername = req.params.username;
    const profileUser = await User.findOne({ username: profileUsername });

    if (!profileUser) {
      console.log("User not found:", profileUsername);
      return res.status(404).send("User not found");
    }

    console.log("Profile user found:", profileUser);

    // Fetch profile user's favorite songs from the database
    const favoriteSongs = await Music.find({
      name: { $in: profileUser.favorites },
    });
    console.log("Favorite songs fetched:", favoriteSongs);

    // Fetch profile user's followers and following users from the database
    const followers = await User.find({
      username: { $in: profileUser.follower },
    });
    const following = await User.find({
      username: { $in: profileUser.following },
    });
    console.log("Followers fetched:", followers);
    console.log("Following fetched:", following);

    // Fetch profile user's reviews and include song images
    const reviews = await Review.find({ userName: profileUser.username });
    const reviewsWithImages = await Promise.all(
      reviews.map(async (review) => {
        const song = await Music.findOne({ name: review.songName });
        return {
          ...review.toObject(),
          songImage: song ? song.image : null,
        };
      })
    );
    console.log("Reviews with images fetched:", reviewsWithImages);

    // Get the original user from the session
    const originalUser = req.session.user;
    console.log("Original user from session:", originalUser);

    res.render("userpage", {
      originalUser,
      user: profileUser,
      reviews: reviewsWithImages,
      favoriteSongs,
      followers,
      following,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Server error");
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

    res.json({
      success: true,
      message: "Review updated successfully.",
      updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Admin API - Get user by username
app.get("/api/admin/user/:username", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const foundUser = await User.findOne({ username: req.params.username });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: foundUser });
  } catch (error) {
    console.error("Error finding user by ID:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Admin API - Update user
app.put("/api/admin/user/:username", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is logged in and is an admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { firstname, surname, email, type } = req.body;

    // Validate required fields
    if (!firstname || !surname || !email || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      {
        firstname,
        surname,
        email,
        type,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the admin is updating their own account
    if (user.username === req.params.username) {
      // Destroy session and redirect to login page
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Failed to log out user" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        return res.json({
          success: true,
          message: "User updated and logged out. Redirecting to login page.",
          redirect: "/", // Include redirect URL in the response
        });
      });
    } else {
      // If the admin is updating someone else's account, just return success
      res.json({
        success: true,
        message: "User updated successfully.",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Admin API - Delete user
app.delete("/api/admin/user/:username", async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is logged in and is an admin
    if (!user || user.type !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete user
    const deletedUser = await User.findOneAndDelete({
      username: req.params.username,
    });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await Review.deleteMany({ userName: req.params.username });

    // Check if the admin is deleting their own account
    if (user.username === req.params.username) {
      // Destroy session and redirect to login page
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Failed to log out user" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        return res.json({
          success: true,
          message: "User deleted and logged out. Redirecting to login page.",
          redirect: "/", // Include redirect URL in the response
        });
      });
    } else {
      // If the admin is deleting someone else's account, just return success
      res.json({
        success: true,
        message: "User deleted successfully.",
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Admin user management page
app.get("/admin/users", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.type !== "admin") {
      console.log("Unauthorized access attempt to user admin");
      return res.redirect("/home");
    }

    res.render("admin/userpage_admin", { user });
  } catch (error) {
    console.error("Error loading admin user page:", error);
    res.status(500).send("Error loading admin user page");
  }
});
