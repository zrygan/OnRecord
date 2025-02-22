const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/OnRecord')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const schema_user = new mongoose.Schema({
    surname: { type: String, required: true },
    firstname: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ }, 
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 }, 
    birthday: { type: Date, required: true },
    date_created: { type: Date, default: Date.now },
    type: { type: String, default: "normal", enum: ["normal", "admin"] }
});

const User = mongoose.model('User', schema_user);

// CRUD Functions
const create_user = async (surname, firstname, email, username, password, birthday) => {
    try {
        const new_user = new User({
            surname,
            firstname,
            email,
            username,
            password,
            birthday,
            type: "normal"
        });

        await new_user.save();
        console.log('User created:', new_user);
    } catch (error) {
        console.error('Error creating user:', error.message);
    }
};

const read_user_all = async () => {
    try {
        const users = await User.find();
        console.log('All users:', users);
    } catch (error) {
        console.error('Error reading users:', error.message);
    }
};

const update_user = async (id, username, email) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            username,
            email
        }, { new: true });

        if (!updatedUser) {
            console.log('User not found');
        } else {
            console.log('User updated:', updatedUser);
        }
    } catch (error) {
        console.error('Error updating user:', error.message);
    }
};

const delete_user = async (id) => {
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            console.log('User not found');
        } else {
            console.log('User deleted');
        }
    } catch (error) {
        console.error('Error deleting user:', error.message);
    }
};

// Export the functions
module.exports = {
    create_user,
    read_user_all,
    update_user,
    delete_user,
    User 
};
