const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/onrecord", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB"));

// Define the Review Schema
const reviewSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userPic: { type: String, required: true },
  songID: { type: mongoose.Schema.Types.ObjectId, ref: "Music", required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

// CRUD Operations for Reviews

// Create a Review
const create_review = async (userID, userName, userPic, songID, comment, rating) => {
  try {
    const newReview = new Review({ userID, userName, userPic, songID, comment, rating });
    await newReview.save();
    console.log("Review created:", newReview);
  } catch (error) {
    console.error("Error creating review:", error.message);
  }
};

// Read all reviews for a specific song
const read_reviews_by_song = async (songID) => {
  try {
    const reviews = await Review.find({ songID }).sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    console.error("Error reading reviews:", error.message);
  }
};

// Read all reviews by a specific user
const read_reviews_by_user = async (userID) => {
  try {
    const reviews = await Review.find({ userID }).sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    console.error("Error reading user reviews:", error.message);
  }
};

// Update a Review
const update_review = async (reviewID, comment, rating) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewID,
      { comment, rating },
      { new: true }
    );
    if (!updatedReview) {
      console.log("Review not found");
    } else {
      console.log("Review updated:", updatedReview);
    }
  } catch (error) {
    console.error("Error updating review:", error.message);
  }
};

// Delete a Review
const delete_review = async (reviewID) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(reviewID);
    if (!deletedReview) {
      console.log("Review not found");
    } else {
      console.log("Review deleted:", deletedReview);
    }
  } catch (error) {
    console.error("Error deleting review:", error.message);
  }
};

// Export the functions and model
module.exports = {
  create_review,
  read_reviews_by_song,
  read_reviews_by_user,
  update_review,
  delete_review,
  Review,
};
