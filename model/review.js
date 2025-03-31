const fs = require("fs");
const mongoose = require("mongoose");

// mongoose OMITTED
//   .connect("mongodb://localhost:27017/onrecord", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch(() => console.error("Could not connect to MongoDB"));

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  song: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Music', 
    required: true 
  },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);


// fs.readFile("data\review.json", "utf8", async (err, data) => { OMITTED
//   if (err) {
//     console.error("Error reading file:", err);
//     return;
//   }

//   try {
//     // Parse JSON data
//     const reviews = JSON.parse(data);

//     await Review.deleteMany({});
//     console.log("Review collection emptied");

//     for (const review of reviews) {
//       await create_review(
//         review.userName,
//         review.userPic,
//         review.songName,
//         review.comment,
//         review.rating,
//         review.createdAt,
//       );
//     }
//     console.log("Review data inserted successfully");
//   } catch (err) {
//     console.error("Error processing data:", err);
//   }
// });

// Create a Review - now takes user ID and song ID instead of names
const create_review = async (userId, songId, comment, rating) => {
  try {
    const newReview = new Review({ 
      user: userId, 
      song: songId, 
      comment, 
      rating 
    });
    await newReview.save();
    console.log("Review created:", newReview.comment);
    return newReview;
  } catch (error) {
    console.error("Error creating review:", error.message);
    throw error;
  }
};

// Read all reviews for a specific song - now takes song ID
const read_reviews_by_song = async (songId) => {
  try {
    const reviews = await Review.find({ song: songId })
      .populate('user', 'username image') // Only get username and image from user
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    console.error("Error reading reviews:", error.message);
    throw error;
  }
};

// Read all reviews by a specific user - now takes user ID
const read_reviews_by_user = async (userId) => {
  try {
    const reviews = await Review.find({ user: userId })
      .populate('song', 'name artists album image') // Get key song info
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    console.error("Error reading user reviews:", error.message);
    throw error;
  }
};

// Update a Review (unchanged)
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
    return updatedReview;
  } catch (error) {
    console.error("Error updating review:", error.message);
    throw error;
  }
};

// Delete a Review (unchanged)
const delete_review = async (reviewID) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(reviewID);
    if (!deletedReview) {
      console.log("Review not found");
    } else {
      console.log("Review deleted:", deletedReview);
    }
    return deletedReview;
  } catch (error) {
    console.error("Error deleting review:", error.message);
    throw error;
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
