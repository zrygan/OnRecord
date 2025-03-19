const fs = require("fs");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/onrecord", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.error("Could not connect to MongoDB"));

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userPic: { type: String, required: true },
  songName: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

fs.readFile("data\\review.json", "utf8", async (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    // Parse JSON data
    const reviews = JSON.parse(data);

    await Review.deleteMany({});
    console.log("Review collection emptied");

    for (const review of reviews) {
      await create_review(
        review.userName,
        review.userPic,
        review.songName,
        review.comment,
        review.rating,
        review.createdAt,
      );
    }
    console.log("Review data inserted successfully");
  } catch (err) {
    console.error("Error processing data:", err);
  }
});

// Create a Review
const create_review = async (userName, userPic, songName, comment, rating) => {
  try {
    const newReview = new Review({ userName, userPic, songName, comment, rating });
    await newReview.save();
    console.log("Review created:", newReview);
  } catch (error) {
    console.error("Error creating review:", error.message);
  }
};

// Read all reviews for a specific song
const read_reviews_by_song = async (songName) => {
  try {
    const reviews = await Review.find({ songName }).sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    console.error("Error reading reviews:", error.message);
  }
};

// Read all reviews by a specific user
const read_reviews_by_user = async (userName) => {
  try {
    const reviews = await Review.find({ userName }).sort({ createdAt: -1 });
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
