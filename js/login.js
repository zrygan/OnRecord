const express = require("express");
const router = express.Router();
const { read_user } = require("../model/user");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", username);

    const user = await read_user(null, username);
    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      console.log(
        "Password incorrect. Provided:",
        password,
        "Stored:",
        user.password
      );
      return res.status(400).json({ error: "Password incorrect" });
    }

    req.session.user = user;
    return res.status(200).json({ message: "Successfully logged in" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
