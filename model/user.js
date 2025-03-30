const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// mongoose
//   .connect("mongodb://localhost:27017/onrecord")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch(() => console.error("Could not connect to MongoDB"));

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
  image: {
    type: String,
    default:
      "https://i.pinimg.com/736x/f2/01/1b/f2011bfb4e87a2e5219bd4c2fb02a5e9.jpg",
  },
  bio: { type: String, default: "No bio provided" },
  customNote: { type: String, default: "No custom note provided" },
  status: { type: String, enum: ["Online", "Offline"], default: "Online" },
  countryOrigin: { type: String, default: "Unspecified" },
  feel: {
    type: String,
    enum: ["😀", "😢", "😡", "😱", "😍", "😎", "🤔", "😴", "🤢", "🤯"],
    default: "😎",
  },
  follower: { type: [String], default: [] }, // list of usernames
  following: { type: [String], default: [] }, // list of usernames
  favorites: { type: [String], default: [] }, // list of music names
});

// Password hashing
schema_user.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // generate the SALT
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
schema_user.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing password...");
    // More robust error handling for bcrypt comparison
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Bcrypt comparison result: ${result}`);
    return result;
  } catch (error) {
    console.error("Error in comparePassword:", error);
    throw error;
  }
};

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
  type,
  image,
  bio,
  customNote,
  status,
  countryOrigin,
  feel,
  follower,
  following,
  favorites
) => {
  try {
    const new_user = new User({
      surname,
      firstname,
      email,
      username,
      password,
      birthday,
      type,
      image,
      bio,
      customNote,
      status,
      countryOrigin,
      feel,
      follower,
      following,
      favorites,
    });

    await new_user.save();
    console.log("User created:", new_user.username);
    return true;
  } catch (error) {
    console.error("Error creating user:", error.message);
  }

  return false;
};

const read_user_all = async () => {
  try {
    const users = await User.find();
    // console.log("All users:", users);
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
// fs.readFile("data\user.json", "utf8", async (err, data) => {
//   if (err) {
//     console.error("Error reading file:", err);
//     return;
//   }

//   try {
//     // Parse JSON data
//     const users = JSON.parse(data);
//     const defaultImage = "https://i.pinimg.com/736x/f2/01/1b/f2011bfb4e87a2e5219bd4c2fb02a5e9.jpg"; // If no image is provided, use this default image

//     // Empty the User collection
//     await User.deleteMany({});
//     console.log("User collection emptied");

//     // Insert the data into the database
//     for (const user of users) {
//       await create_user(
//         user.surname,
//         user.firstname,
//         user.email,
//         user.username,
//         user.password,
//         user.birthday,
//         user.type,
//         user.image || defaultImage,
//         user.bio,
//         user.customNote,
//         user.status,
//         user.countryOrigin,
//         user.feel,
//         user.follower,
//         user.following,
//         user.favorites
//       );
//     }
//     console.log("User data inserted successfully");
//   } catch (err) {
//     console.error("Error processing data:", err);
//   }
// });

// Export the functions
module.exports = {
  create_user,
  read_user_all,
  read_user,
  update_user,
  delete_user,
  User,
};
