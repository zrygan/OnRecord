// This file is the server file for the project
// It will be used to handle the requests and responses
// from the client side

const express = require("express");
const app = express();
const path = require("path");
// const hbs = require("hbs");
const {User} = require("../model/user");
const Album = require("../model/album");
const { read_music_all } = require("../model/music");
const { Music } = require("../model/music");
const session = require("express-session");

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

const viewPath = path.join(__dirname, "../pages");

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", viewPath);

// Serve static files from root directory
app.use(express.static(path.join(__dirname, "../")));

// Configure session middleware
app.use(session({
  secret: 'SUPER-DUPER-SECRET-KEY-NO-ONE-CAN-KNOW', // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Root route to serve index page
app.get("/", (req, res) => {
  res.render("index");
});

// Route to render home page
app.get("/home", async (req, res) => {
  try {
    const music = await Music.find();
    const user = req.session.user;

    const musicWithCounts = await Promise.all(music.map(async (song) => {
      const reviews = await Review.countDocuments({ songId: song._id });
      return {
        ...song.toObject(),
        hearts: song.likes.length,
        reviews: reviews // FIXME: add once reviews are done
      };
    }));

    res.render("home", { music: musicWithCounts, user });
  } catch (error) {
    console.error("Error fetching music data:", error);
    res.status(500).send("Error fetching music data");
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
    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Registration failed", e });
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
    song.likes = song.likes.filter(user => user !== username);
    await song.save();
    res.json({ likes: song.likes });
  } catch (error) {
    console.error("Error unliking song:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
