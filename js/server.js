// This file is the server file for the project
// It will be used to handle the requests and responses
// from the client side

const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const users = require("../model/user");

const viewPath = path.join(__dirname, "../pages");

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", viewPath);

// Serve static files from root directory
app.use(express.static(path.join(__dirname, "../")));

// Root route to serve index page
app.get("/", (req, res) => {
  res.render("index");
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await users.findOne({ username, password });

    if (user) {
      res.status(200).json({
        success: true,
        user: {
          username: user.username,
          type: user.type,
        },
      });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error, please try again" });
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
        : "normal",
  };

  try {
    const checker = await users.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });

    if (checker) {
      res.status(400).json({ error: "User already exists" });
    } else {
      const newUser = new users(data);
      await newUser.save();
      res.status(200).json({ success: true });
    }
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Registration failed", e });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
