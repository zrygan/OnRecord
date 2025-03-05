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

    // First check if user exists with that username
    const userExists = await users.findOne({ username });

    if (userExists) {
      // If user exists, check password separately
      const passwordMatch = await users.findOne({ username, password });

      if (passwordMatch) {
        res.status(200).json({
          success: true,
          user: {
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
        error: `The acocunt ${username} doesn't exist, please register first.`,
      });
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
    // Check username uniqueness first
    const usernameExists = await users.findOne({ username: data.username });
    if (usernameExists) {
      return res
        .status(400)
        .json({
          error: `Username ${data.username} is already taken, please choose another.`,
        });
    }

    // Then check email uniqueness
    const emailExists = await users.findOne({ email: data.email });
    if (emailExists) {
      return res
        .status(400)
        .json({ error: `Email ${data.email} is already registered.` });
    }

    // If both are unique, create the user
    const newUser = new users(data);
    await newUser.save();
    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ error: "Registration failed", e });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
