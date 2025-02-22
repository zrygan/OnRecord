const mongoose = require('mongoose');
const User = require('./user'); 

mongoose.connect('mongodb://localhost:27017/OnRecord', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    testCRUD();
})
.catch(err => console.error('Could not connect to MongoDB', err));

const testCRUD = async () => {
    // Create a valid user
    await User.create_user("Doe", "John", "john.doe@example.com", "johndoe", "password123", new Date("1990-01-01"));

    // Create an invalid user (to demonstrate validation failure)
    await User.create_user("Smith", "Jane", "jane.smith@example.com", "janesmith", "pass", new Date("1995-05-05")); // Should fail due to password length

    // Read all users
    await User.read_user_all();

    // Assuming you have some users created, update the first user
    const users = await User.User.find(); // Get all users to perform update and delete
    if (users.length > 0) {
        await User.update_user(users[0]._id, "johnnydoe", "johnny.doe@example.com"); // Update the first user
        await User.delete_user(users[0]._id); // Delete the first user
    }

    // Final read to confirm deletion
    await User.read_user_all();

    // Close the connection
    mongoose.connection.close();
};

