const mongoose = require("mongoose");
const User = require("./user");

mongoose
  .connect("mongodb://localhost:27017/OnRecord", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    testCRUD();
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

const testCRUD = async () => {
  // Create a valid user
  await User.create_user(
    "Vincent",
    "Matthew Atsuo",
    "matthew.v@example.com",
    "chewy",
    "pass123",
    new Date("2002-07-14")
  );

  // read users
  await User.read_user_all();

  // Close the connection
  mongoose.connection.close();
};
