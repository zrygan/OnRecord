const mongoose = require("mongoose");
const fs = require("fs");

mongoose
  .connect("mongodb://localhost:27017/onrecord")
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB"));

const schema_user = new mongoose.Schema({
  surname: { type: String, required: true },
  firstname: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._$%^*!]+$/, // Allows only letters, numbers, and specified symbols
  },
  password: { type: String, required: true, minlength: 6 },
  birthday: { type: Date, required: true },
  date_created: { type: Date, default: Date.now },
  type: {
    type: String,
    default: "normal",
    enum: ["normal", "admin", "artist"],
  },
  image: { type: String },
});

// Define the User model
const User = mongoose.model("user", schema_user);

module.exports = User;

// CRUD Functions
const create_user = async (
  surname,
  firstname,
  email,
  username,
  password,
  birthday,
  image
) => {
  try {
    const new_user = new User({
      surname,
      firstname,
      email,
      username,
      password,
      birthday,
      image,
    });

    await new_user.save();
    console.log("User created:", new_user);
    return true;
  } catch (error) {
    console.error("Error creating user:", error.message);
  }

  return false;
};

const read_user_all = async () => {
  try {
    const users = await User.find();
    console.log("All users:", users);
    return users;
  } catch (error) {
    console.error("Error reading users:", error.message);
  }
};

const read_user = async (id, username) => {
  try {
    const user = await User.findOne({
      $or: [{ _id: id }, { username: username }],
    });
    if (!user) {
      console.log("User not found");
    } else {
      console.log("User found:", user);
      return user;
    }
  } catch (error) {
    console.error("Error reading user:", error.message);
  }

  return null;
};

const update_user = async (id, username, email) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username,
        email,
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found");
    } else {
      console.log("User updated:", updatedUser);
      return true;
    }
  } catch (error) {
    console.error("Error updating user:", error.message);
  }

  return false;
};

const delete_user = async (id) => {
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      console.log("User not found");
    } else {
      console.log("User deleted");
      return true;
    }
  } catch (error) {
    console.error("Error deleting user:", error.message);
  }
  return false;
};

// Read JSON file
fs.readFile("data\\user.json", "utf8", async (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    // Parse JSON data
    const users = JSON.parse(data);
    const defaultImage = "https://i.pinimg.com/736x/f2/01/1b/f2011bfb4e87a2e5219bd4c2fb02a5e9.jpg"; // If no image is provided, use this default image

    // Empty the User collection
    await User.deleteMany({});
    console.log("User collection emptied");

    // Insert the data into the database
    for (const user of users) {
      await create_user(
        user.surname,
        user.firstname,
        user.email,
        user.username,
        user.password,
        user.birthday,
        user.image || defaultImage
      );
    }
    console.log("User data inserted successfully");
  } catch (err) {
    console.error("Error processing data:", err);
  }
});

// Export the functions
module.exports = {
  create_user,
  read_user_all,
  read_user,
  update_user,
  delete_user,
  User,
};